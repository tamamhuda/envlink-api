import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription';
import { SubscriptionRepository } from 'src/database/repositories/subscription.repository';
import Subscription from 'src/database/entities/subscription.entity';
import Plan from 'src/database/entities/plan.entity';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import { PlansEnum } from 'src/common/enums/plans.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { XenditService } from 'src/common/xendit/xendit.service';
import { XenditRecurringPlanData } from 'src/common/interfaces/xendit.interface';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly xenditService: XenditService,
  ) {}

  private assignTotalAmount(
    currentSubs: Subscription,
    strategy: UpgradeStrategy,
    amount: number,
    discount: number = 0,
  ) {
    let totalAmount = discount ? amount - discount : amount;
    if (
      strategy === UpgradeStrategy.UPGRADE_IMMEDIATELY &&
      currentSubs.plan.name !== PlansEnum.FREE
    ) {
      const daysRemaining =
        (currentSubs.expiresAt &&
          Math.ceil(
            (currentSubs.expiresAt.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          )) ??
        0;
      const billingCycle =
        (currentSubs.expiresAt &&
          currentSubs.expiresAt.getTime() - daysRemaining) ??
        0;
      const remainingValue =
        currentSubs.amountPaid * (daysRemaining / billingCycle);
      totalAmount = totalAmount - remainingValue;
    }
    return totalAmount;
  }
  async upgradeSubscriptionPlan(
    id: string,
    body: UpgradeSubscriptionDto,
  ): Promise<XenditRecurringPlanData> {
    const subscriptionTransaction =
      await this.subscriptionRepository.manager.transaction(async (manager) => {
        const { amount, description, newPlan, schedule, strategy, discount } =
          body;

        // Get current subscription plan and user
        const currentSubs = await manager
          .findOneOrFail(Subscription, {
            where: { id },
            relations: ['user'],
          })
          .catch(() => {
            throw new NotFoundException(`Subscription not found`);
          });
        const user = currentSubs.user;

        // Validate is current subcription is upgradable
        const existingPendingSubscription = await manager.findOneBy(
          Subscription,
          {
            user: { id: user.id },
            status: SubscriptionStatus.PENDING,
          },
        );
        if (
          existingPendingSubscription ||
          currentSubs.status !== SubscriptionStatus.ACTIVE ||
          (currentSubs.expiresAt && currentSubs.expiresAt < new Date())
        ) {
          throw new BadRequestException(`Subscription is not upgradable`);
        }

        // Get new  plan
        const planToUpgrade = await manager
          .findOneByOrFail(Plan, {
            name: newPlan,
          })
          .catch(() => {
            throw new NotFoundException(`Plan not found`);
          });

        // Calculate price new subscription plan
        const totalAmount = this.assignTotalAmount(
          currentSubs,
          strategy,
          amount,
          discount,
        );

        // Create new subscription with pending status
        const subscription = manager.create(Subscription, {
          user,
          plan: planToUpgrade,
          interval: schedule.interval,
          period: schedule.period,
          status: SubscriptionStatus.PENDING,
          transactionStatus: 'PENDING',
          description,
        });
        subscription.initializeSubscriptionPeriod();

        // Create new recurring plan payment
        const recurringPlan =
          await this.xenditService.resolveRequestRecurringPlan(
            strategy,
            planToUpgrade.name,
            subscription,
            {
              interval: schedule.period,
              interval_count: schedule.interval,
            },
            totalAmount,
            user,
          );

        subscription.metadata =
          recurringPlan.metadata as Subscription['metadata'];
        await manager.save(subscription);

        // return recurring plan payment
        return await this.xenditService.createRecurringPlan(recurringPlan);
      });
    return subscriptionTransaction;
  }
}
