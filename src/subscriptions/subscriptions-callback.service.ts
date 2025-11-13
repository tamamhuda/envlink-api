import { BadRequestException, Injectable } from '@nestjs/common';
import { OkDto } from 'src/common/dto/response.dto';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { RecurringCycleStatus } from 'src/common/enums/recurring-cycle-status.enum';
import { RecurringCycleType } from 'src/common/enums/recurring-cycle-type.enum';
import { SubscriptionEndReason } from 'src/common/enums/subscription-end-reason.enum';
import { SubscriptionHistoryStatus } from 'src/common/enums/subscription-history-status.enum';
import { SubscriptionHistoryType } from 'src/common/enums/subscription-history-type.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { TransactionStatus } from 'src/common/enums/trasaction-status.enum';
import {
  RecurringCycleAttempt,
  RecurringCycleCallback,
  RecurringCycleData,
  RecurringPlanCallback,
} from 'src/common/interfaces/xendit.interface';
import { XenditService } from 'src/common/xendit/xendit.service';
import { PaymentMethod } from 'src/database/entities/payment-method.entity';
import { SubscriptionCycle } from 'src/database/entities/subscription-cycle.entity';
import Subscription from 'src/database/entities/subscription.entity';
import { Transaction } from 'src/database/entities/transaction.entity';
import { User } from 'src/database/entities/user.entity';
import { SubscriptionHistoryRepository } from 'src/database/repositories/subscription-history.repository';
import { SubscriptionRepository } from 'src/database/repositories/subscription.repository';
import { SubscriptionsService } from './subscriptions.service';
import LoggerService from 'src/common/logger/logger.service';
import { SubscriptionHistory } from 'src/database/entities/subscription-history.entity';
import { UserService } from 'src/user/user.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SEND_MAIL_SUBSCRIPTION_QUEUE } from 'src/queue/queue.constans';
import { SendMailSubscriptionJob } from 'src/queue/interfaces/mail-subscription.interface';
import { SubscriptionsCyclesService } from './cycles/cycles.service';

@Injectable()
export class SubscriptionsCallbackService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly xenditService: XenditService,
    private readonly historyRepository: SubscriptionHistoryRepository,
    private readonly subscriptionService: SubscriptionsService,
    private readonly cycleService: SubscriptionsCyclesService,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    @InjectQueue(SEND_MAIL_SUBSCRIPTION_QUEUE)
    private readonly sendMailSubscription: Queue<SendMailSubscriptionJob>,
  ) {}

  async handleRecurringActivated(body: RecurringPlanCallback): Promise<OkDto> {
    const {
      data: { id: externalId, amount },
    } = body;

    const existingSubscription =
      await this.subscriptionService.getSubscriptionByExternalId(externalId);
    const previousSubscription = existingSubscription.user.activeSubscription;

    const upgradedSubscription =
      await this.subscriptionRepository.manager.transaction(async (manager) => {
        // Update and Initialize Subscription Period and Update user active subscription activated
        existingSubscription.initializeSubscriptionPeriod();
        const upgradedSubscription = manager.merge(
          Subscription,
          existingSubscription,
          {
            amountPaid: amount,
            status: SubscriptionStatus.ACTIVE,
            transactionStatus: TransactionStatus.PAID,
          },
        );
        const { user } = await manager.save(upgradedSubscription);

        // Deactivated previous user subscription
        const previousSubscription = user.activeSubscription;
        const {
          id: previouseSubscriptionId,
          externalId: previouseSubscriptionExternalId,
          plan: previousPlan,
        } = previousSubscription;

        // Deactivated previous recurring plan by existing external id
        if (
          previouseSubscriptionExternalId &&
          previousPlan.name !== PlanEnum.FREE
        ) {
          await this.xenditService.deactivateRecurringPlan(
            previouseSubscriptionExternalId,
          );
        } else {
          await manager.update(Subscription, previouseSubscriptionId, {
            status: SubscriptionStatus.INACTIVE,
            endReason: SubscriptionEndReason.UPGRADED,
          });
        }

        // Set user active subscription with upgraded subscription
        await manager.update(User, user.id, {
          activeSubscription: upgradedSubscription,
        });

        return upgradedSubscription;
      });

    // Create subscription history upgraded subscription
    const { metadata, user, id: upgradedSubscriptionId } = upgradedSubscription;
    await this.historyRepository.createOne({
      user,
      previousSubscription,
      newSubscription: upgradedSubscription,
      status: SubscriptionHistoryStatus.SUCCEEDED,
      type: SubscriptionHistoryType.UPGRADED,
      metadata,
    });

    // Send email notification (queue event: subscription.created or subscription.upgraded)
    const { plan: previousPlan } = previousSubscription;
    const base = {
      subscriptionId: upgradedSubscriptionId,
      to: {
        address: user.email,
        name: user.fullName,
      },
    };
    if (previousPlan.name === PlanEnum.FREE) {
      await this.sendMailSubscription.add(
        `mail_sub_created_${upgradedSubscriptionId}}`,
        {
          event: 'subscription.created',
          ...base,
        },
      );
    } else {
      await this.sendMailSubscription.add(
        `mail_sub_upgraded_${upgradedSubscriptionId}}`,
        {
          event: 'subscription.upgraded',
          ...base,
        },
      );
    }

    return {
      message: 'OK',
    };
  }

  async handleOninitialInactivated(
    subscription: Subscription,
    externalId: string,
    failureCode?: string,
  ) {
    const { user } = subscription;
    const previousSubscription = user.activeSubscription;
    const recurringCycles =
      await this.xenditService.getAllCyclesByRecurringPlanId(externalId);
    const recurringCycleData = recurringCycles[0];
    const { id: subscriptionCycleExternalId } = recurringCycles[0];

    // Create or Update first subscription cycle
    const subscriptionCycle = await this.createOrUpdateSubscriptionCycle(
      subscriptionCycleExternalId,
      subscription,
      recurringCycleData,
    );

    // Create or Get transaction for failed upgrade (status: FAILED) by subscription cycle
    await this.createOrGetTransactionBySubscriptionCycle(
      recurringCycleData,
      subscriptionCycle,
    );

    // Create subscription history upgraded failed (status: FAILED) with failure code
    const historyUpgraded = {
      user,
      previousSubscription,
      newSubscription: subscription,
      type: SubscriptionHistoryType.UPGRADED,
      reason: failureCode,
    };

    await this.historyRepository.createOne({
      ...historyUpgraded,
      status: SubscriptionHistoryStatus.FAILED,
    });
  }

  async handleInactiveOnPending(
    externalId: string,
    existingSubs: Subscription,
    failureCode?: string,
  ): Promise<SubscriptionEndReason | null> {
    let endReason: SubscriptionEndReason | null = null;

    const inactiveOnLinkExpired = failureCode === 'LINKING_URL_EXPIRED';
    const { user, transactionStatus } = existingSubs;
    const previousSubscription = user.activeSubscription;
    const baseHistorySubscription: Partial<SubscriptionHistory> = {
      user,
      previousSubscription,
      newSubscription: existingSubs,
      type: SubscriptionHistoryType.UPGRADED,
      status: SubscriptionHistoryStatus.CANCELLED,
    };
    if (inactiveOnLinkExpired) {
      endReason = SubscriptionEndReason.EXPIRED_LINK;
      await this.historyRepository.createOne({
        ...baseHistorySubscription,
        reason: failureCode,
      });
    } else if (!failureCode) {
      endReason = SubscriptionEndReason.CANCELLED_BY_ADMIN;
      await this.historyRepository.createOne({
        ...baseHistorySubscription,
        reason: endReason,
      });
    } else if (
      failureCode &&
      (transactionStatus === TransactionStatus.FAILED ||
        transactionStatus === 'RETRYING')
    ) {
      await this.handleOninitialInactivated(
        existingSubs,
        externalId,
        failureCode,
      );
      endReason = SubscriptionEndReason.EXPIRED_PAYMENT_FAILED;
    }
    return endReason;
  }

  async handleInactiveOnActive(
    existingSubs: Subscription,
  ): Promise<SubscriptionEndReason> {
    let endReason = SubscriptionEndReason.CANCELLED_BY_ADMIN;
    const {
      id: currentSubscriptionId,
      currentCycle: cycleNumber,
      endedAt,
      user: { id: userId },
    } = existingSubs;
    const currentCycle =
      await this.cycleService.findOneBySubscriptionIdAndCycleNumber(
        currentSubscriptionId,
        cycleNumber,
      );

    if (
      endedAt &&
      endedAt.getDate() <= Date.now() &&
      currentCycle.cycleNumber == existingSubs.totalRecurrence &&
      currentCycle.status === RecurringCycleStatus.SUCCEEDED
    ) {
      endReason = SubscriptionEndReason.COMPLETED;
    } else {
      const { activeSubscription } =
        await this.userService.findUserById(userId);
      if (currentCycle.status !== RecurringCycleStatus.SUCCEEDED) {
        endReason = SubscriptionEndReason.EXPIRED_PAYMENT_FAILED;
      } else if (activeSubscription.id !== currentSubscriptionId) {
        endReason = SubscriptionEndReason.UPGRADED;
      }
    }
    return endReason;
  }

  async handleRecurringInactivated(
    body: RecurringPlanCallback,
  ): Promise<OkDto> {
    const {
      data: { id: externalId, failure_code: failureCode },
    } = body;
    // Get subscription to update current user subscription
    const existingSubs =
      await this.subscriptionService.getSubscriptionByExternalId(externalId);
    let endReason: SubscriptionEndReason | null = existingSubs.endReason;

    const deactivatedSubscription =
      await this.subscriptionRepository.manager.transaction(async (manager) => {
        if (!endReason) {
          switch (existingSubs.status) {
            case SubscriptionStatus.PENDING:
              endReason = await this.handleInactiveOnPending(
                externalId,
                existingSubs,
                failureCode,
              );
              break;
            case SubscriptionStatus.ACTIVE:
              endReason = await this.handleInactiveOnActive(existingSubs);
              break;
          }
        }

        const subscriptionInactive = manager.merge(Subscription, existingSubs, {
          status: SubscriptionStatus.INACTIVE,
          endReason,
          cancellationDate: new Date(),
        });

        const {
          user: { id: userId, activeSubscription },
        } = await manager.save(subscriptionInactive);

        // Check if user active subscription id equals to existing subscription id
        if (activeSubscription.id === existingSubs.id) {
          // Fetch user fresh with current activeSubscription relation
          const user = await manager.findOneOrFail(User, {
            where: { id: userId },
            relations: ['activeSubscription'],
          });

          // Create fallback free subscription for user
          const fallbackFreeSubscription =
            await this.subscriptionService.createFallbackFreeSubscription(user);

          await manager.update(User, user.id, {
            activeSubscription: fallbackFreeSubscription,
          });

          // Create subscription history upgraded subscription
          await this.historyRepository.createOne({
            user,
            previousSubscription: existingSubs,
            newSubscription: fallbackFreeSubscription,
            status: SubscriptionHistoryStatus.SUCCEEDED,
            type: SubscriptionHistoryType.DEACTIVATED,
          });
        }

        // cancelled all cycle of deactivated subscription
        await manager
          .createQueryBuilder()
          .update(SubscriptionCycle)
          .set({ status: RecurringCycleStatus.CANCELLED })
          .where('subscriptionId = :subscriptionId', {
            subscriptionId: existingSubs.id,
          })
          .andWhere('status = :status', {
            status: RecurringCycleStatus.SCHEDULED,
          })
          .execute();

        return subscriptionInactive;
      });

    // Send email notification (queue event: subscription.deactivated)
    const { user, id: subscriptionId } = deactivatedSubscription;
    await this.sendMailSubscription.add(
      `mail_sub_deactivated_${subscriptionId}}`,
      {
        event: 'subscription.deactivated',
        subscriptionId,
        to: {
          address: user.email,
          name: user.fullName,
        },
      },
    );

    return {
      message: 'OK',
    };
  }

  async handleRecurringPlan(body: RecurringPlanCallback): Promise<OkDto> {
    const { event } = body;
    switch (event) {
      // Update subscription activated
      // Create subscription history for upgraded success
      // Send email notification (queue event: subscription.created or subscription.upgraded)
      case 'recurring.plan.activated':
        return this.handleRecurringActivated(body);

      // Update subscription inactivated
      // Create first subscription cycle if on initial inactivated
      // Create or Get transaction for failed upgrade (status: FAILED) by subscription cycle
      // Create subscription history for upgrade failed with failure code (expired or initial attempt)
      // Send email notification (queue event: subscription.deactivated)
      case 'recurring.plan.inactivated':
        return this.handleRecurringInactivated(body);
      default:
        throw new BadRequestException('Unknown event');
    }
  }

  private resolveAttempt(
    status: RecurringCycleStatus,
    attemptCount: number,
    attempt_details: RecurringCycleAttempt[],
  ) {
    let payment_link: string | null = null;
    let failure_code: string | null = null;
    let action_id: string | null = null;
    switch (status) {
      case RecurringCycleStatus.SUCCEEDED: {
        // Add any successful attempt action_id if not already stored
        const succeededAttempt = attempt_details.find(
          (a) => a.status === 'SUCCEEDED' && a.action_id,
        );
        if (succeededAttempt?.action_id) {
          action_id = succeededAttempt.action_id;
        }
        break;
      }

      case RecurringCycleStatus.RETRYING: {
        // Add new attempt IDs for retries, capture failure code and payment link if available
        const retryAttempt = attempt_details.find((a) => a.action_id);
        payment_link =
          attempt_details.find(
            (a) =>
              a.type === 'PAYMENT_LINK' && a.action_number === attemptCount,
          )?.payment_link?.payment_link_url || null;

        if (retryAttempt && retryAttempt.action_id) {
          action_id = retryAttempt.action_id;
          failure_code = retryAttempt.failure_code || null;
        }
        break;
      }
    }
    return {
      action_id,
      failure_code,
      payment_link,
    };
  }

  resolveAttemptDetails(
    attempt_details: RecurringCycleAttempt[],
    status: RecurringCycleStatus,
    attempt_count: number,
  ): {
    paymentRequestId: string | null;
    failureCode: string | null;
    invoiceId: string | null;
    paymentType: PaymentType;
    paymentLinkFailedRetry: string | null;
  } {
    let paymentRequestId: string | null = null;
    let paymentType: PaymentType = PaymentType.PAYMENT_REQUEST;
    let invoiceId: string | null = null;
    let paymentLinkFailedRetry: string | null = null;
    const matchedAttempt = attempt_details.find((attempt) => {
      if (status === RecurringCycleStatus.SUCCEEDED)
        return (
          (attempt.status === 'SUCCEEDED' && attempt.action_id) ||
          (attempt.status === 'SUCCEEDED' &&
            attempt.type === 'PAYMENT_LINK' &&
            attempt.payment_link)
        );
      if (status === RecurringCycleStatus.FAILED)
        return attempt.status === 'FAILED' && attempt.action_id;
      if (status === RecurringCycleStatus.CANCELLED)
        return attempt.status === 'FAILED' && attempt.action_id;
      return false;
    });

    switch (matchedAttempt?.status) {
      case 'SUCCEEDED':
        if (matchedAttempt.type === 'PAYMENT_LINK') {
          paymentType = PaymentType.PAYMENT_LINK;
          paymentRequestId =
            attempt_details.find(
              (a) =>
                a.status === 'FAILED' && a.attempt_number === attempt_count,
            )?.action_id || null;
          invoiceId = matchedAttempt.payment_link?.invoice_id || null;
        } else {
          paymentRequestId = matchedAttempt.action_id;
        }
        break;
      case 'RETRYING':
        paymentLinkFailedRetry =
          attempt_details.find(
            (a) =>
              a.type === 'PAYMENT_LINK' && a.action_number === attempt_count,
          )?.payment_link?.payment_link_url || null;
        paymentType = PaymentType.PAYMENT_REQUEST;
        paymentRequestId = matchedAttempt?.action_id || null;
        break;
      default:
        paymentType = PaymentType.PAYMENT_REQUEST;
        paymentRequestId = matchedAttempt?.action_id || null;
    }

    return {
      paymentRequestId,
      failureCode: matchedAttempt?.failure_code || null,
      invoiceId,
      paymentType,
      paymentLinkFailedRetry,
    };
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
        relations: ['subscription', 'subscription.plan', 'subscription.user'],
      });

      const {
        status,
        type,
        scheduled_timestamp: scheduledDate,
        cycle_number: cycleNumber,
        attempt_count: attemptCount,
        attempt_details,
      } = recurringCycleData;

      const actionIds = Array.isArray(existingCycle?.actionIds)
        ? [...existingCycle.actionIds]
        : [];

      let paymentMethod: PaymentMethod | undefined =
        existingCycle?.paymentMethod || undefined;
      let referenceId: string | null = existingCycle?.referenceId || null;
      const {
        paymentRequestId,
        paymentLinkFailedRetry,
        failureCode,
        paymentType,
        invoiceId,
      } = this.resolveAttemptDetails(attempt_details, status, attemptCount);

      if (paymentRequestId && !actionIds.includes(paymentRequestId)) {
        actionIds.push(paymentRequestId);
        const paymentRequest =
          await this.xenditService.getPaymentRequestById(paymentRequestId);

        const {
          paymentMethod: { id: paymentMethodExternalId },
        } = paymentRequest;
        referenceId = paymentRequest.referenceId;

        // Get Related Payment Method from Database
        paymentMethod =
          (await manager.findOneBy(PaymentMethod, {
            externalId: paymentMethodExternalId,
          })) || undefined;
      }

      // If no existing cycle → create a new one
      if (!existingCycle) {
        // Update subscription for next billing
        if (type === RecurringCycleType.SCHEDULED) {
          await manager.update(Subscription, subscription.id, {
            nextBillingDate: scheduledDate,
          });
        }

        const newCycle = manager.create(SubscriptionCycle, {
          externalId,
          referenceId,
          type,
          status,
          cycleNumber,
          attemptCount,
          scheduledDate,
          paymentType,
          subscription,
          actionIds,
          failureCode,
          paymentMethod,
          invoiceId,
          paymentLinkFailedRetry,
        });

        return await manager.save(newCycle);
      }

      if (status === RecurringCycleStatus.SUCCEEDED) {
        await manager.update(Subscription, subscription.id, {
          currentCycle: cycleNumber,
        });
      } else {
        await manager.update(Subscription, subscription.id, {
          nextBillingDate: scheduledDate,
        });
      }

      // Otherwise, update existing cycle
      const updatedCycle = manager.merge(SubscriptionCycle, existingCycle, {
        type,
        status,
        cycleNumber,
        attemptCount,
        failureCode,
        paymentType,
        actionIds,
        paymentLinkFailedRetry,
        paymentMethod,
        invoiceId,
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
        const { amount, currency } = data;

        // Get Related Payment Method from Database
        const paymentMethod = subscriptionCycle.paymentMethod;

        const referenceId = subscriptionCycle.referenceId;
        if (!paymentMethod || !referenceId)
          throw new BadRequestException(`Payment method not found`);

        // Check if Transaction Already Exists
        const existingTransaction = await manager.findOneBy(Transaction, {
          referenceId,
        });
        if (existingTransaction) return existingTransaction;

        // Resolve Transaction Status
        const resolveStatusByPaymentRequestStatus = (
          status: RecurringCycleStatus,
        ): TransactionStatus => {
          switch (status) {
            case RecurringCycleStatus.SUCCEEDED:
              return TransactionStatus.PAID;
            case RecurringCycleStatus.FAILED:
              return TransactionStatus.FAILED;
            case RecurringCycleStatus.CANCELLED:
              return TransactionStatus.FAILED;
            default:
              return TransactionStatus.REFUSED;
          }
        };

        // let status: TransactionStatus;
        const status = resolveStatusByPaymentRequestStatus(
          subscriptionCycle.status,
        );

        // Create and Save Transaction
        let paymentMethodType: string | undefined = paymentMethod.type;
        const { subscription, failureCode, paymentType, invoiceId } =
          subscriptionCycle;
        const { metadata } = subscription;
        const { plan, user } = subscription;
        if (
          invoiceId &&
          subscriptionCycle.status === RecurringCycleStatus.SUCCEEDED &&
          paymentType === PaymentType.PAYMENT_LINK
        ) {
          const invoice = await this.xenditService.getInvoiceById(invoiceId);
          paymentMethodType = invoice.paymentMethod;
        }

        const transaction = manager.create(Transaction, {
          referenceId,
          amount,
          currency,
          user,
          paymentMethod,
          subscription,
          subscriptionCycle,
          metadata,
          status,
          productName: `Envlink ${plan.name} Subscription`,
          paymentMethodType,
          paidAt: status === TransactionStatus.PAID ? new Date() : null,
          failureCode,
          paymentType,
          failedAt: failureCode ? new Date() : null,
        });

        return await manager.save(transaction);
      } catch (error: any) {
        throw new BadRequestException(
          `Error creating transaction for recurring cycle: ${error.message}`,
        );
      }
    });
  }

  async handleRecurringCycleRetrying(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;
    const subscription =
      await this.subscriptionService.getSubscriptionByExternalId(
        recurringPlanId,
      );

    await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );

    // Send email notification (queue event: subscription.payment_failed)
    const { user, id: subscriptionId } = subscription;
    await this.sendMailSubscription.add(
      `mail_sub_payment_failed_${subscriptionId}`,
      {
        event: 'subscription.payment_failed',
        subscriptionId,
        to: {
          address: user.email,
          name: user.fullName,
        },
      },
    );

    return {
      message: 'OK',
    };
  }

  async handleRecurringCycleCreated(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;

    const subscription =
      await this.subscriptionService.getSubscriptionByExternalId(
        recurringPlanId,
      );

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
      await this.subscriptionService.getSubscriptionByExternalId(
        recurringPlanId,
      );

    const subscriptionCycle = await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );

    await this.createOrGetTransactionBySubscriptionCycle(
      data,
      subscriptionCycle,
    );

    // Create subscription history renewed subscription success
    // Send email notification (queue event: subscription.renewed), for cycle type scheduled
    const { metadata, user, id: subscriptionId } = subscription;
    const { type } = subscriptionCycle;
    if (type === RecurringCycleType.SCHEDULED) {
      await this.historyRepository.createOne({
        user,
        previousSubscription: subscription,
        newSubscription: subscription,
        status: SubscriptionHistoryStatus.SUCCEEDED,
        type: SubscriptionHistoryType.RENEWED,
        metadata,
      });

      await this.sendMailSubscription.add(
        `mail_sub_renewed_${subscriptionId}}`,
        {
          event: 'subscription.renewed',
          subscriptionId: subscriptionId,
          to: {
            address: user.email,
            name: user.fullName,
          },
        },
      );
    }

    return {
      message: 'OK',
    };
  }

  async handleRecurringCycleFailed(data: RecurringCycleData) {
    const { plan_id: recurringPlanId, id: cycleExternalId } = data;

    const subscription =
      await this.subscriptionService.getSubscriptionByExternalId(
        recurringPlanId,
      );

    const subscriptionCycle = await this.createOrUpdateSubscriptionCycle(
      cycleExternalId,
      subscription,
      data,
    );

    const { failureCode } =
      await this.createOrGetTransactionBySubscriptionCycle(
        data,
        subscriptionCycle,
      );

    // Create subscription history renewed subscription failed
    const { metadata, user } = subscription;
    await this.historyRepository.createOne({
      user,
      previousSubscription: subscription,
      newSubscription: subscription,
      status: SubscriptionHistoryStatus.FAILED,
      type: SubscriptionHistoryType.RENEWED,
      metadata,
      reason: failureCode,
    });

    return {
      message: 'OK',
    };
  }

  async handleRecurringCycle(body: RecurringCycleCallback): Promise<OkDto> {
    const { data, event } = body;
    switch (event) {
      case 'recurring.cycle.created':
        // Create new subscription cycle for next scheduled cycle
        // Schedule email notification for reminder for next bill
        return await this.handleRecurringCycleCreated(data);
      case 'recurring.cycle.retrying':
        // Update existing subscription cycle and track failure action ids
        // Send email notification (queue event: subscription.payment_failed), manually retry with payment link (if applicable)
        return await this.handleRecurringCycleRetrying(data);
      case 'recurring.cycle.succeeded':
        // Create or Update subscription cycle and create new transaction
        // create new subscription history (renewed)
        // Send email notification (queue event: subscription.renewed)
        return await this.handleRecurringCycleSucceeded(data);
      case 'recurring.cycle.failed':
        // Update existing subscriptionCycle and create new transaction (failed)
        // create subscription history (renewed failed with reason)
        // Send email notification (queue event: subscription.failed)
        return await this.handleRecurringCycleFailed(data);
      default:
        throw new BadRequestException('Invalid event');
    }
  }
}
