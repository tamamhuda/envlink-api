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
import { SubscriptionInfoDto } from './dto/subscription.dto';
import {
  RecurringCycleCallback,
  RecurringCycleData,
  RecurringPlanCallback,
  RecurringPlanData,
} from 'src/common/interfaces/xendit.interface';
import { OkDto } from 'src/common/dto/response.dto';
import { User } from 'src/database/entities/user.entity';
import LoggerService from 'src/common/logger/logger.service';
import { SubscriptionCycle } from 'src/database/entities/subscription-cycle.entity';
import { PaymentMethod } from 'src/database/entities/payment-method.entity';
import { Transaction } from 'src/database/entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/trasaction-status.enum';
import { RecurringCycleStatus } from 'src/common/enums/recurring-cycle-status.enum';
import { PaymentRequestStatus } from 'xendit-node/payment_request/models';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly xenditService: XenditService,
    private readonly logger: LoggerService,
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
  ): Promise<SubscriptionInfoDto> {
    const subscriptionTransaction: SubscriptionInfoDto =
      await this.subscriptionRepository.manager.transaction(async (manager) => {
        const { amount, description, plan, schedule, strategy, discount } =
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
        let user = currentSubs.user;

        // Get customer id by Get or create customer
        let customer_id = user.externalId;
        if (!customer_id) {
          const customer = await this.xenditService.getOrCreateCustomer(user);
          user = manager.merge(User, user, { externalId: customer.id });
          await manager.save(user);
          customer_id = customer.id;
        }

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
        const newPlan = await manager
          .findOneByOrFail(Plan, {
            name: plan,
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
          plan: newPlan,
          interval: schedule.interval,
          period: schedule.period,
          status: SubscriptionStatus.PENDING,
          transactionStatus: 'PENDING',
          description,
        });
        await manager.save(subscription);

        // Create new recurring plan payment
        const referenceId = subscription.assignReferenceId();
        const { name: previousPlan } = currentSubs.plan;
        const recurringPlan = this.xenditService.resolveRequestRecurringPlan(
          referenceId,
          strategy,
          previousPlan,
          newPlan,
          {
            interval: schedule.period,
            interval_count: schedule.interval,
          },
          totalAmount,
          customer_id,
          user,
        );

        // Create new xendit recurring plan payment
        const {
          schedule: recurringPlanSchedule,
          actions: recurringPlanActions,
          id: externalId,
        } = await this.xenditService.createRecurringPlan(recurringPlan);

        // Update new subscription
        const { metadata } = recurringPlan;
        const updatedSubscription = manager.merge(Subscription, subscription, {
          metadata,
          externalId,
          referenceId,
        });
        await manager.save(updatedSubscription);

        // return recurring plan payment
        return {
          ...updatedSubscription,
          schedule: recurringPlanSchedule,
          actions: recurringPlanActions,
        };
      });
    return subscriptionTransaction;
  }

  async getSubscriptionByIdAndRecurringPlan(id: string): Promise<{
    subscription: Subscription;
    recurringPlan: RecurringPlanData;
  }> {
    const subscription = await this.subscriptionRepository.findOneById(id);
    if (!subscription || !subscription.externalId)
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

  async getSubscriptionById(id: string): Promise<SubscriptionInfoDto> {
    const { subscription, recurringPlan } =
      await this.getSubscriptionByIdAndRecurringPlan(id);

    const { schedule, actions } = recurringPlan;

    return {
      ...subscription,
      schedule,
      actions,
    };
  }

  private async updateByExternalIdWithTransaction(
    externalId: string,
    subscriptionData: Partial<Subscription>,
  ) {
    // Get subscription to upgrade user subscription
    const upgradedSubscription =
      await this.getSubscriptionByExternalId(externalId);

    return this.subscriptionRepository.manager.transaction(async (manager) => {
      const { id: upgradedSubscriptionId, user } = upgradedSubscription;
      const { status: updateStatus } = subscriptionData;

      // Initialize Subscription Period and Update user active subscription if activated
      if (updateStatus === SubscriptionStatus.ACTIVE) {
        upgradedSubscription.initializeSubscriptionPeriod();
        await manager.save(upgradedSubscription);

        // Deactivated previous user subscription
        const previouseSubscription = user.activeSubscription;
        await manager.update(Subscription, previouseSubscription.id, {
          status: SubscriptionStatus.INACTIVE,
        });

        // Set user active subscription with upgraded subscription
        await manager.update(User, user.id, {
          activeSubscription: upgradedSubscription,
        });

        // Set fallback to free subscription if current subscription is not free
      } else if (user.activeSubscription.plan.name !== PlansEnum.FREE) {
        const plan = await manager.findOneByOrFail(Plan, {
          name: PlansEnum.FREE,
        });
        const fallbackfreeSubscription = manager.create(Subscription, {
          user,
          plan,
        });
        fallbackfreeSubscription.initializeSubscriptionPeriod();
        await manager.save(fallbackfreeSubscription);

        await manager.update(User, user.id, {
          activeSubscription: fallbackfreeSubscription,
        });
      }

      // Update subscription data
      await manager.update(
        Subscription,
        upgradedSubscriptionId,
        subscriptionData,
      );

      return upgradedSubscription;
    });
  }

  async handleSubscriptionActivated(
    body: RecurringPlanCallback,
  ): Promise<OkDto> {
    const {
      data: { id: externalId, amount },
    } = body;

    await this.updateByExternalIdWithTransaction(externalId, {
      status: SubscriptionStatus.ACTIVE,
      transactionStatus: 'PAID',
      amountPaid: amount,
    });

    return await Promise.resolve({
      message: 'OK',
    });
  }

  async handleSubscriptionInactivated(
    body: RecurringPlanCallback,
  ): Promise<OkDto> {
    const {
      data: { id, failure_code: failureCode },
    } = body;

    let subscriptionCycle: SubscriptionCycle | null = null;

    const recurringCycles =
      await this.xenditService.getListRecurringCyclesByRecyrringPlanId(id);
    const onFirstCycleInactivated = recurringCycles.length === 1;

    const subscription = await this.updateByExternalIdWithTransaction(id, {
      status: SubscriptionStatus.INACTIVE,
      transactionStatus: TransactionStatus.FAILED,
      failureCode,
    });

    if (onFirstCycleInactivated) {
      const recurringCycleData = recurringCycles[0];
      const { id: subscriptionCycleExternalId } = recurringCycles[0];
      subscriptionCycle = await this.createOrUpdateSubscriptionCycle(
        subscriptionCycleExternalId,
        subscription,
        recurringCycleData,
      );

      await this.createOrGetTransactionBySubscriptionCycle(
        recurringCycleData,
        subscriptionCycle,
      );
    }

    return await Promise.resolve({
      message: 'OK',
    });
  }

  async handleRecurringPlan(body: RecurringPlanCallback): Promise<OkDto> {
    const { event } = body;
    switch (event) {
      case 'recurring.plan.activated':
        return this.handleSubscriptionActivated(body);
      case 'recurring.plan.inactivated':
        return this.handleSubscriptionInactivated(body);
      default:
        throw new BadRequestException('Unknown event');
    }
  }

  async createOrUpdateSubscriptionCycle(
    externalId: string,
    subscription: Subscription,
    recurringCycleData: RecurringCycleData,
  ): Promise<SubscriptionCycle> {
    return this.subscriptionRepository.manager.transaction(async (manager) => {
      // Try to find existing subscription cycle
      const existingCycle = await manager.findOne(SubscriptionCycle, {
        where: { externalId },
        relations: ['subscription', 'subscription.plan'],
      });

      const {
        status,
        type,
        scheduled_timestamp: scheduledDate,
        cycle_number: cycleNumber,
        attempt_count: attemptCount,
        attempt_details,
      } = recurringCycleData;

      // Prepare tracking data (failureCode + actionIds)
      let failureCode: string | null = null;
      const actionIds = Array.isArray(existingCycle?.actionIds)
        ? [...existingCycle.actionIds]
        : [];

      switch (status) {
        case RecurringCycleStatus.SUCCEEDED: {
          // Add any successful attempt action_id if not already stored
          const succeededAttempt = attempt_details.find(
            (a) => a.status === 'SUCCEEDED' && a.action_id,
          );
          if (
            succeededAttempt?.action_id &&
            !actionIds.includes(succeededAttempt.action_id)
          ) {
            actionIds.push(succeededAttempt.action_id);
          }
          break;
        }

        case RecurringCycleStatus.RETRYING: {
          // Add new attempt IDs for retries and capture failure code
          const retryAttempt = attempt_details.find(
            (a) => a.action_id && !actionIds.includes(a.action_id),
          );
          if (retryAttempt && retryAttempt.action_id) {
            actionIds.push(retryAttempt.action_id);
            failureCode = retryAttempt.failure_code || null;
          }
          break;
        }

        // Other statuses: leave unchanged (no-op)
      }

      // If no existing cycle → create a new one
      if (!existingCycle) {
        const newCycle = manager.create(SubscriptionCycle, {
          externalId,
          type,
          status,
          cycleNumber,
          attemptCount,
          scheduledDate,
          subscription,
          actionIds,
          failureCode,
        });

        // Update subscription for next billing
        await manager.update(Subscription, subscription.id, {
          nextBillingDate: scheduledDate,
        });

        return await manager.save(newCycle);
      }

      // Otherwise, update existing cycle
      const updatedCycle = manager.merge(SubscriptionCycle, existingCycle, {
        type,
        status,
        cycleNumber,
        attemptCount,
        failureCode,
        actionIds,
      });

      return await manager.save(updatedCycle);
    });
  }

  async createOrGetTransactionBySubscriptionCycle(
    data: RecurringCycleData,
    subscriptionCycle: SubscriptionCycle,
  ): Promise<Transaction> {
    return this.subscriptionRepository.manager.transaction(async (manager) => {
      try {
        const {
          attempt_details,
          status: recurringCycleStatus,
          amount,
          currency,
        } = data;

        // Resolve Payment Request ID and Failure Code
        const resolveAttemptDetails = (): {
          paymentRequestId: string;
          failureCode?: string | null;
        } => {
          const matchedAttempt = attempt_details.find((attempt) => {
            if (recurringCycleStatus === RecurringCycleStatus.SUCCEEDED)
              return attempt.status === 'SUCCEEDED' && attempt.action_id;
            if (recurringCycleStatus === RecurringCycleStatus.FAILED)
              return attempt.status === 'FAILED' && attempt.action_id;
            if (recurringCycleStatus === RecurringCycleStatus.CANCELLED)
              return attempt.status === 'FAILED' && attempt.action_id;
            return false;
          });

          if (!matchedAttempt?.action_id)
            throw new Error(
              'No valid payment request ID found in recurring attempt details',
            );

          return {
            paymentRequestId: matchedAttempt.action_id,
            failureCode: matchedAttempt.failure_code || null,
          };
        };

        const { paymentRequestId, failureCode } = resolveAttemptDetails();

        // Fetch Payment Request Info from Xendit
        const paymentRequest =
          await this.xenditService.getPaymentRequestById(paymentRequestId);
        const {
          paymentMethod: { id: paymentMethodExternalId },
          referenceId,
          status: paymentRequestStatus,
        } = paymentRequest;

        // Get Related Payment Method from Database
        const paymentMethod = await manager.findOneBy(PaymentMethod, {
          externalId: paymentMethodExternalId,
        });
        if (!paymentMethod)
          throw new Error(
            `Payment method not found (externalId=${paymentMethodExternalId})`,
          );

        // Check if Transaction Already Exists
        const existingTransaction = await manager.findOneBy(Transaction, {
          referenceId,
        });
        if (existingTransaction) return existingTransaction;

        // Resolve Transaction Status
        const resolveTransactionStatus = (
          status: PaymentRequestStatus,
        ): TransactionStatus => {
          switch (status) {
            case 'SUCCEEDED':
              return TransactionStatus.PAID;
            case 'FAILED':
              return TransactionStatus.FAILED;
            case 'PENDING':
              return TransactionStatus.PENDING;
            default:
              return TransactionStatus.REFUSED;
          }
        };

        const transactionStatus =
          resolveTransactionStatus(paymentRequestStatus);

        // Create and Save Transaction
        const { subscription } = subscriptionCycle;
        const transaction = manager.create(Transaction, {
          referenceId,
          amount,
          currency,
          paymentMethod,
          subscriptionCycle,
          subscription,
          status: transactionStatus,
          productName: `Envlink ${subscription.plan.name} Subscription`,
          paymentMethodType: paymentMethod.type,
          paidAt:
            transactionStatus === TransactionStatus.PAID ? new Date() : null,
          failureCode,
        });

        return await manager.save(transaction);
      } catch (error: any) {
        throw new Error(
          `Error creating transaction for recurring cycle: ${error.message}`,
        );
      }
    });
  }

  async handleRecurringCycleRetrying(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;

    const subscription =
      await this.getSubscriptionByExternalId(recurringPlanId);
    await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );
    return {
      message: 'OK',
    };
  }

  async handleRecurringCycleCreated(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;

    const subscription =
      await this.getSubscriptionByExternalId(recurringPlanId);
    await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );
    return {
      message: 'OK',
    };
  }

  async handleRecurringCycleSucceeded(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;

    const subscription =
      await this.getSubscriptionByExternalId(recurringPlanId);
    const subscriptionCycle = await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );

    await this.createOrGetTransactionBySubscriptionCycle(
      data,
      subscriptionCycle,
    );
    return {
      message: 'OK',
    };
  }

  async handleRecurringCycleFailed(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;

    const subscription =
      await this.getSubscriptionByExternalId(recurringPlanId);
    const subscriptionCycle = await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );

    await this.createOrGetTransactionBySubscriptionCycle(
      data,
      subscriptionCycle,
    );
    return {
      message: 'OK',
    };
  }

  async handleRecurringCycle(body: RecurringCycleCallback): Promise<OkDto> {
    const { data, event } = body;
    switch (event) {
      case 'recurring.cycle.created':
        // Create new subscription cycle for next scheduled cycle
        // Triggered queue scheduled for reminder for next bill
        return await this.handleRecurringCycleCreated(data);
      case 'recurring.cycle.retrying':
        // Update existing subscription cycle and track failure action ids
        return await this.handleRecurringCycleRetrying(data);
      case 'recurring.cycle.succeeded':
        // Create or Update subscription cycle and create new transaction
        // Send email notification to user (queue event: subscription.activated)
        return await this.handleRecurringCycleSucceeded(data);
      case 'recurring.cycle.failed':
        // Update existing subscriptionCycle and create new transaction
        // Send email notification to user (queue event: subscription.failed)
        return await this.handleRecurringCycleFailed(data);
      default:
        throw new BadRequestException('Invalid event');
    }
  }

  async findSubscriptionByUserExternalId(
    userExternalId: string,
  ): Promise<Subscription> {
    const subscription =
      await this.findSubscriptionByUserExternalId(userExternalId);
    if (!subscription) throw new NotFoundException('Subscription not found');
    return await this.findSubscriptionByUserExternalId(userExternalId);
  }
}
