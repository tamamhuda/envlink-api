import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpgradeSubscriptionBodyDto } from './dto/upgrade-subscription.dto';
import { SubscriptionRepository } from 'src/database/repositories/subscription.repository';
import Subscription from 'src/database/entities/subscription.entity';
import Plan from 'src/database/entities/plan.entity';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { XenditService } from 'src/common/xendit/xendit.service';
import { SubscriptionInfoDto } from './dto/subscription.dto';
import {
  RecurringPaymentMethod,
  RecurringPlanData,
} from 'src/common/interfaces/xendit.interface';
import { User } from 'src/database/entities/user.entity';
import LoggerService from 'src/common/logger/logger.service';
import { PlanRepository } from 'src/database/repositories/plan.reposiotry';
import { PlanEnum } from 'src/common/enums/plans.enum';
import {
  UpgradeOptionsDto,
  UpgradePlanOptionDto,
} from './dto/upgrade-plan-option.dto';
import { SubscriptionEndReason } from 'src/common/enums/subscription-end-reason.enum';
import { PaymentMethodRepository } from 'src/database/repositories/payment-method.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planRepository: PlanRepository,
    private readonly xenditService: XenditService,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly logger: LoggerService,
  ) {}

  async findUserSubscriptionById(
    userId: string,
    id: string,
  ): Promise<Subscription> {
    const existingSubscription =
      await this.subscriptionRepository.findOneByIdAndUserId(userId, id);
    if (!existingSubscription)
      throw new NotFoundException('Subscription not found');
    return existingSubscription;
  }

  private mapSubscriptionToDto(
    subscription: Subscription,
    actions?: SubscriptionInfoDto['actions'],
  ): SubscriptionInfoDto {
    const { interval, intervalCount, totalRecurrence, user, ...rest } =
      subscription;
    return {
      ...rest,
      userId: user.id,
      schedule: { interval, intervalCount, totalRecurrence },
      actions,
    };
  }

  getUpgradePlanOption(
    currentSubs: Subscription,
    targetPlan: Plan,
    discount = 0,
  ): UpgradePlanOptionDto {
    const { expiresAt, startedAt, plan, amountPaid } = currentSubs;
    const now = new Date();

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(
      Math.ceil((expiresAt!.getTime() - startedAt!.getTime()) / msPerDay),
      1,
    );
    const usedDays = Math.max(
      Math.ceil((now.getTime() - startedAt!.getTime()) / msPerDay),
      0,
    );
    const remainingDays = Math.max(totalDays - usedDays, 0);

    const newPlan = targetPlan.name;

    // Base default if not upgradable
    if (newPlan === plan.name || newPlan === PlanEnum.FREE) {
      return { ...targetPlan, upgradable: false, options: [] };
    }

    const A_current = amountPaid;
    const A_new = targetPlan.price;
    const remainingCredit = A_current * (remainingDays / totalDays);

    const netAmountImmediate = Math.max(A_new - remainingCredit - discount, 0);
    const netAmountFinishCycle = Math.max(A_new - discount, 0);

    const makeOption = (
      strategy: UpgradeStrategy,
      upgradable: boolean,
      remainingCreditValue: number,
      netAmount: number,
    ): UpgradeOptionsDto => ({
      strategy,
      upgradable,
      currentPlan: plan.name,
      newPlan,
      amount: A_new,
      discount,
      remainingDays,
      remainingCredit: Math.round(remainingCreditValue),
      netAmount: Math.round(netAmount),
    });

    const options: UpgradeOptionsDto[] = [];

    if (remainingDays > 7 && plan.name !== PlanEnum.FREE) {
      options.push(
        makeOption(
          UpgradeStrategy.UPGRADE_IMMEDIATELY,
          true,
          remainingCredit,
          netAmountImmediate,
        ),
        makeOption(
          UpgradeStrategy.FINISH_CURRENT_CYCLE,
          true,
          0,
          netAmountFinishCycle,
        ),
      );
    } else {
      options.push(
        makeOption(UpgradeStrategy.UPGRADE_IMMEDIATELY, true, 0, A_new),
        makeOption(
          UpgradeStrategy.FINISH_CURRENT_CYCLE,
          false,
          0,
          netAmountFinishCycle,
        ),
      );
    }

    return { ...targetPlan, upgradable: true, options };
  }

  async getAllUpgradePlanOptions(
    userId: string,
    subscriptionId: string,
    discount: number = 0,
  ): Promise<UpgradePlanOptionDto[]> {
    const currentSubs = await this.findUserSubscriptionById(
      userId,
      subscriptionId,
    );

    if (
      !currentSubs.expiresAt ||
      !currentSubs.startedAt ||
      currentSubs.status !== SubscriptionStatus.ACTIVE
    ) {
      throw new BadRequestException('Subscription is not active or valid');
    }

    const allPlans = await this.planRepository.findAll();
    const results: UpgradePlanOptionDto[] = [];

    for (const plan of allPlans) {
      const option = this.getUpgradePlanOption(currentSubs, plan, discount);
      results.push(option);
    }

    return results;
  }

  async upgradeSubscriptionPlan(
    userId: string,
    id: string,
    body: UpgradeSubscriptionBodyDto,
  ): Promise<SubscriptionInfoDto> {
    return await this.subscriptionRepository.manager.transaction(
      async (manager) => {
        const { description, plan, schedule, strategy, discount } = body;

        // Validate is current subcription is upgradable
        const existingPendingSubscription =
          await this.subscriptionRepository.findOneByUserIdAndStatus(
            userId,
            SubscriptionStatus.PENDING,
          );

        // Get current subscription plan and user
        const currentSubs = await this.findUserSubscriptionById(userId, id);

        // Calculate price new subscription plan
        const newPlan = await manager.findOneByOrFail(Plan, { name: plan });
        const upgradePlanOption = this.getUpgradePlanOption(
          currentSubs,
          newPlan,
          discount || 0,
        ).options.find((option) => option.strategy === strategy);

        if (
          !upgradePlanOption ||
          existingPendingSubscription ||
          currentSubs.status !== SubscriptionStatus.ACTIVE
        )
          throw new BadRequestException(`Subscription is not upgradable`);

        // Get customer id by Get or create customer
        let user = currentSubs.user;
        let customer_id = user.externalId;
        if (!customer_id) {
          const customer = await this.xenditService.getOrCreateCustomer(user);
          user = manager.merge(User, user, { externalId: customer.id });
          await manager.save(user);
          customer_id = customer.id;
        }

        // Get all payment methods for the customer
        const paymentMethods: RecurringPaymentMethod[] = (
          await this.paymentMethodRepository.findManyRecurringByUser(userId)
        ).map(({ externalId, rank }) => {
          return {
            payment_method_id: externalId,
            rank,
          };
        });

        // Create new subscription with pending status
        const {
          netAmount,
          currentPlan: previousPlan,
          amount,
          remainingCredit: previousRemainingCredit,
          remainingDays: previousRemainingDays,
        } = upgradePlanOption;

        const metadata: Subscription['metadata'] = {
          strategy,
          previousPlan,
          newPlan: newPlan.name,
          previousExternalId: currentSubs.externalId,
          previousRemainingCredit,
          previousRemainingDays,
          amount,
          discount,
          netAmount,
        };

        const subscription = manager.create(Subscription, {
          user,
          plan: newPlan,
          ...schedule,
          metadata,
          amount,
          status: SubscriptionStatus.PENDING,
          transactionStatus: 'PENDING',
          description,
        });
        await manager.save(subscription);

        // Create new recurring plan payment
        const referenceId = subscription.assignReferenceId();

        const recurringPlan = this.xenditService.resolveRequestRecurringPlan(
          referenceId,
          metadata,
          subscription.plan,
          {
            interval: schedule.interval,
            interval_count: schedule.intervalCount,
            total_recurrence: schedule.totalRecurrence,
          },
          netAmount,
          customer_id,
          paymentMethods,
          user,
        );

        // Create new xendit recurring plan payment
        const { id: externalId, actions: recurringActions } =
          await this.xenditService.createRecurringPlan(recurringPlan);
        const actions = recurringActions?.map((action) => {
          return {
            ...action,
            urlType: action.url_type,
          };
        });

        // Update new subscription with externalId and referenceId
        const mergedSubscription = manager.merge(Subscription, subscription, {
          externalId,
          referenceId,
        });
        await manager.save(mergedSubscription);

        return this.mapSubscriptionToDto(mergedSubscription, actions);
      },
    );
  }

  async getUserSubscriptionByIdAndRecurringPlan(
    userId: string,
    id: string,
  ): Promise<{
    subscription: Subscription;
    recurringPlan: RecurringPlanData;
  }> {
    const subscription = await this.subscriptionRepository.findOneById(id);
    if (
      !subscription ||
      !subscription.externalId ||
      subscription.user.id !== userId
    )
      throw new NotFoundException('Subscription not found');
    const { externalId } = subscription;

    const recurringPlan =
      await this.xenditService.getRecurringPlanById(externalId);
    return { subscription, recurringPlan };
  }

  async getSubscriptionByExternalId(externalId: string): Promise<Subscription> {
    const subscription =
      await this.subscriptionRepository.findOneByExternalId(externalId);
    if (!subscription || !subscription.externalId)
      throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async getSubscriptionByExternalIdAndRecurringPlan(
    externalId: string,
  ): Promise<{
    subscription: Subscription;
    recurringPlan: RecurringPlanData;
  }> {
    const subscription = await this.getSubscriptionByExternalId(externalId);

    const recurringPlan =
      await this.xenditService.getRecurringPlanById(externalId);
    return { subscription, recurringPlan };
  }

  async findActiveSubscriptionByUserId(userId: string) {
    const existingSubscription =
      await this.subscriptionRepository.findOneByUserIdAndStatus(
        userId,
        SubscriptionStatus.ACTIVE,
      );

    const user = existingSubscription?.user;
    const activeSubscription = user?.activeSubscription;

    if (!existingSubscription || !activeSubscription) {
      throw new NotFoundException('Active subscription not found');
    }
    return existingSubscription;
  }

  async getUserActiveSubscription(
    userId: string,
  ): Promise<SubscriptionInfoDto> {
    const activeSubscription =
      await this.findActiveSubscriptionByUserId(userId);
    return this.mapSubscriptionToDto(activeSubscription);
  }

  async getUserSubscriptionById(
    userId: string,
    id: string,
  ): Promise<SubscriptionInfoDto> {
    const subscription = await this.subscriptionRepository.findOneByIdAndUserId(
      userId,
      id,
    );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const { externalId, status } = subscription;

    let actions: SubscriptionInfoDto['actions'] = undefined;
    if (externalId && status === SubscriptionStatus.PENDING) {
      const recurringPlan =
        await this.xenditService.getRecurringPlanById(externalId);
      actions = recurringPlan.actions?.map((action) => {
        return {
          ...action,
          urlType: action.url_type,
        };
      });
    }

    return this.mapSubscriptionToDto(subscription, actions);
  }

  async createFallbackFreeSubscription(user: User): Promise<Subscription> {
    const plan = await this.planRepository
      .findOneByOrFail({
        name: PlanEnum.FREE,
      })
      .catch(() => {
        throw new NotFoundException('Plan not found');
      });

    const fallbackfreeSubscription = this.subscriptionRepository.create({
      user,
      plan,
    });
    fallbackfreeSubscription.initializeSubscriptionPeriod();
    return await this.subscriptionRepository.save(fallbackfreeSubscription);
  }

  async findSubscriptionByUserExternalId(
    userExternalId: string,
  ): Promise<Subscription> {
    const subscription =
      await this.findSubscriptionByUserExternalId(userExternalId);
    if (!subscription) throw new NotFoundException('Subscription not found');
    return await this.findSubscriptionByUserExternalId(userExternalId);
  }

  async deactivateSubscription(
    userId: string,
    id: string,
  ): Promise<SubscriptionInfoDto> {
    const existingSubscription = await this.findUserSubscriptionById(
      userId,
      id,
    );

    const { externalId, status, plan } = existingSubscription;

    if (
      !externalId ||
      ![SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING].includes(
        status,
      ) ||
      plan.name === PlanEnum.FREE
    ) {
      throw new BadRequestException('Subscription cannot be deactivated');
    }

    const deactivatedSubscription =
      await this.subscriptionRepository.manager.transaction(async (manager) => {
        await this.xenditService.deactivateRecurringPlan(externalId);

        const updatedSubscription = manager.merge(
          Subscription,
          existingSubscription,
          {
            status: SubscriptionStatus.INACTIVE,
            endReason: SubscriptionEndReason.CANCELLED_BY_USER,
          },
        );
        return await manager.save(updatedSubscription);
      });

    return this.mapSubscriptionToDto(deactivatedSubscription);
  }
}
