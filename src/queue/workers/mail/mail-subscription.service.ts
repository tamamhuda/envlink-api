import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { SubscriptionEndReason } from 'src/common/enums/subscription-end-reason.enum';
import { MailSubscriptionTemplateInfo } from 'src/common/interfaces/mail.interface';
import LoggerService from 'src/common/logger/logger.service';
import { MailUtil } from 'src/common/utils/mail.util';
import { Env } from 'src/config/env.config';
import { SubscriptionCycle } from 'src/database/entities/subscription-cycle.entity';
import Subscription from 'src/database/entities/subscription.entity';
import { SubscriptionCycleRepository } from 'src/database/repositories/subscription-cycle.repository';
import { SubscriptionRepository } from 'src/database/repositories/subscription.repository';
import { TransactionRepository } from 'src/database/repositories/transaction.repository';
import { SubscriptionEventType } from 'src/queue/interfaces/mail-subscription.interface';
import { CcBccItem, EmailAddress } from 'zeptomail/types';

@Injectable()
export class MailSubscriptionService {
  private readonly APP_NAME: string;

  constructor(
    private readonly mailUtil: MailUtil,
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
    private readonly cycleRepository: SubscriptionCycleRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {
    this.APP_NAME = this.config.getOrThrow('APP_NAME');
  }

  async sendNotification(
    event: SubscriptionEventType,
    emailAdress: EmailAddress,
    subscriptionId: string,
  ) {
    const to: CcBccItem[] = [
      {
        email_address: emailAdress,
      },
    ];

    let data: MailSubscriptionTemplateInfo | null = null;
    const subscription = await this.subscriptionRepository
      .findOneOrFail({
        where: { id: subscriptionId },
        relations: [
          'user',
          'plan',
          'user.activeSubscription',
          'user.activeSubscription.plan',
        ],
      })
      .catch(() => {
        throw new Error(`Subscription not found`);
      });

    switch (event) {
      case 'subscription.created':
        data = await this.handleSubscriptionCreated(subscription);
        break;
      case 'subscription.upgraded':
        data = await this.handleSubscriptionUpgraded(subscription);
        break;
      case 'subscription.renewed':
        data = await this.handleSubscriptionRenewed(subscription);
        break;
      case 'subscription.renewal_upcoming':
        data = await this.handleSubscriptionRenewalUpcoming(subscription);
        break;
      case 'subscription.payment_failed':
        data = await this.handleSubscriptionPaymentFailed(subscription);
        break;
      case 'subscription.deactivated':
        data = await this.handleSubscriptionDeactivated(subscription);
        break;
      default:
        throw new Error(`Unknown event`);
    }

    await this.mailUtil.sendTemplateEmail(
      to,
      'SUBSCRIPTION',
      data,
      'Subscription Notification',
    );
  }

  resolveBase(
    subscription: Subscription,
  ): Partial<MailSubscriptionTemplateInfo> {
    const {
      user,
      plan,
      id: subscription_id,
      amount,
      // currentCycle,
      nextBillingDate,
      interval,
    } = subscription;
    // const { scheduledDate: nextBillingDate } =
    //   await this.cycleRepository.findOneOrFail({
    //     where: {
    //       subscription: { id: subscription.id },
    //       cycleNumber: currentCycle,
    //     },
    //   });

    return {
      app_name: this.APP_NAME,
      subscription_id,
      amount: amount.toString(),
      plan_name: plan.name,
      next_billing_date: nextBillingDate
        ? nextBillingDate.toISOString().split('T')[0]
        : '-',
      unsubscribe_url: `https://envlink.one/account/subscriptions/`,
      support_email: 'support@envlink.one',
      help_center_url: 'https://envlink.one/help',
      customer_name: user.fullName,
      billing_cycle: interval,
      manage_subscription_url: `https://envlink.one/account/subscriptions/`,
    };
  }

  async handleSubscriptionCreated(
    subscription: Subscription,
  ): Promise<MailSubscriptionTemplateInfo> {
    const { currentCycle, id: subscriptionId, plan } = subscription;
    const { currency, paymentMethod, paymentMethodType, paymentType, amount } =
      await this.transactionRepository.findOneOrFail({
        where: {
          subscription: { id: subscriptionId },
          subscriptionCycle: { cycleNumber: currentCycle },
        },
        relations: ['subscriptionCycle', 'subscription', 'paymentMethod'],
      });

    let payment_method = paymentMethodType;
    if (paymentType === PaymentType.PAYMENT_REQUEST) {
      const { paymentMethodDisplay } = paymentMethod.getSummary();
      payment_method = paymentMethodDisplay;
    }

    return {
      ...(this.resolveBase(subscription) as MailSubscriptionTemplateInfo),
      currency: currency || 'IDR',
      message: `Thank you for subscribing to the ${plan.name} plan. Your subscription is now active and ready to use.`,
      payment_method,
      amount: amount.toString(),
      subject: `Your ${plan.name} subscription is now active!`,
    };
  }

  async handleSubscriptionUpgraded(
    subscription: Subscription,
  ): Promise<MailSubscriptionTemplateInfo> {
    const { currentCycle, id: subscriptionId, plan, metadata } = subscription;
    const { currency, paymentMethod, paymentMethodType, paymentType, amount } =
      await this.transactionRepository.findOneOrFail({
        where: {
          subscription: { id: subscriptionId },
          subscriptionCycle: { cycleNumber: currentCycle },
        },
        relations: ['subscriptionCycle', 'subscription', 'paymentMethod'],
      });

    let payment_method = paymentMethodType;
    if (paymentType === PaymentType.PAYMENT_LINK) {
      const { paymentMethodDisplay } = paymentMethod.getSummary();
      payment_method = paymentMethodDisplay;
    }

    return {
      ...(this.resolveBase(subscription) as MailSubscriptionTemplateInfo),
      currency: currency || 'IDR',
      message: `Congratulations! You’ve successfully upgraded from ${metadata?.previousPlan} to ${plan.name}. Enjoy higher limits and premium features.`,
      payment_method,
      amount: amount.toString(),
      subject: `You’ve upgraded to ${plan.name}!`,
    };
  }

  async handleSubscriptionRenewed(
    subscription: Subscription,
  ): Promise<MailSubscriptionTemplateInfo> {
    const { currentCycle, id: subscriptionId, plan } = subscription;
    const { currency, paymentMethod, paymentMethodType, paymentType, amount } =
      await this.transactionRepository.findOneOrFail({
        where: {
          subscription: { id: subscriptionId },
          subscriptionCycle: { cycleNumber: currentCycle },
        },
        relations: ['subscriptionCycle', 'subscription', 'paymentMethod'],
      });

    let payment_method = paymentMethodType;
    if (paymentType === PaymentType.PAYMENT_LINK) {
      const { paymentMethodDisplay } = paymentMethod.getSummary();
      payment_method = paymentMethodDisplay;
    }

    return {
      ...(this.resolveBase(subscription) as MailSubscriptionTemplateInfo),
      currency: currency || 'IDR',
      message: `We’ve successfully renewed your ${plan.name} subscription. Your next billing date is shown below.`,
      payment_method,
      amount: amount.toString(),
      subject: `Your ${plan.name} plan has been renewed successfully`,
    };
  }

  async handleSubscriptionRenewalUpcoming(
    subscription: Subscription,
  ): Promise<MailSubscriptionTemplateInfo> {
    const {
      currentCycle,
      id: subscriptionId,
      plan,
      nextBillingDate,
    } = subscription;
    if (!nextBillingDate) throw new Error('Next billing date is missing');

    const { scheduledDate, paymentMethod } =
      await this.cycleRepository.findOneOrFail({
        where: {
          subscription: { id: subscriptionId },
          cycleNumber: currentCycle + 1,
          scheduledDate: nextBillingDate,
        },
        relations: ['paymentMethod'],
      });
    const { paymentMethodDisplay: payment_method, currency } =
      paymentMethod!.getSummary();

    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      ...(this.resolveBase(subscription) as MailSubscriptionTemplateInfo),
      currency,
      message: `Your ${plan.name} plan will renew automatically on ${formattedDate}. Please ensure your payment method is up to date.`,
      payment_method,
      amount: '',
      subject: `Your ${plan.name} plan renews soon – review your subscription`,
    };
  }

  async handleSubscriptionPaymentFailed(
    subscription: Subscription,
  ): Promise<MailSubscriptionTemplateInfo> {
    const {
      currentCycle,
      id: subscriptionId,
      plan,
      nextBillingDate,
    } = subscription;
    if (!nextBillingDate) throw new Error('Next billing date is missing');

    const { paymentLinkFailedRetry, failureCode, paymentMethod } =
      await this.cycleRepository.findOneOrFail({
        where: {
          subscription: { id: subscriptionId },
          cycleNumber: currentCycle + 1,
          scheduledDate: nextBillingDate,
        },
        relations: ['paymentMethod'],
      });
    const { paymentMethodDisplay: payment_method, currency } =
      paymentMethod!.getSummary();

    let message = `We were unable to process your payment for the ${plan.name} plan.`;

    if (failureCode) {
      message += ` Reason: ${failureCode.replace(/_/g, ' ')}.`;
    }

    message += ` Please update your payment details to continue uninterrupted service.`;

    if (paymentLinkFailedRetry) {
      message += ` You can also try completing the payment manually here: ${paymentLinkFailedRetry}`;
    }

    return {
      ...(this.resolveBase(subscription) as MailSubscriptionTemplateInfo),
      currency,
      message,
      payment_method,
      subject: `We couldn’t renew your ${plan.name} subscription`,
    };
  }

  async handleSubscriptionDeactivated(
    subscription: Subscription,
  ): Promise<MailSubscriptionTemplateInfo> {
    const {
      id: subscriptionId,
      plan,
      cancelAtPeriodEnd,
      endReason,
      currentCycle,
    } = subscription;

    const cycle = await this.cycleRepository.findOne({
      where: {
        subscription: { id: subscriptionId },
        cycleNumber: currentCycle,
      },
    });

    const formattedDate = cycle?.scheduledDate
      ? cycle.scheduledDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    // Defaults
    const subject = `Your ${plan.name} subscription has been cancelled`;
    let message = '';
    let payment_method = '-';
    let currency = 'IDR';
    let amount = subscription.amount.toString();

    // Try to fetch the latest transaction if needed
    const transaction =
      cancelAtPeriodEnd &&
      (await this.transactionRepository.findOne({
        where: {
          subscription: { id: subscriptionId },
          subscriptionCycle: { cycleNumber: currentCycle },
        },
        relations: ['subscriptionCycle', 'subscription', 'paymentMethod'],
      }));

    switch (endReason) {
      case SubscriptionEndReason.CANCELLED_BY_USER:
        if (cancelAtPeriodEnd && transaction) {
          const { paymentMethod } = transaction;
          const { paymentMethodDisplay } = paymentMethod.getSummary();
          payment_method = paymentMethodDisplay;
          currency = paymentMethod.currency || 'IDR';
          amount = transaction.amount.toString() || '0';

          message = `Your ${plan.name} subscription has been cancelled. You will continue to have access until your billing period ends on ${formattedDate}.`;
        } else {
          message = `Your ${plan.name} subscription has been cancelled before activation. You will not be charged.`;
        }
        break;

      case SubscriptionEndReason.CANCELLED_BY_ADMIN:
        message = `Your ${plan.name} subscription has been cancelled by an administrator. If you believe this was a mistake, please contact support.`;
        break;

      case SubscriptionEndReason.EXPIRED_PAYMENT_FAILED:
        message = `Your ${plan.name} subscription was cancelled due to repeated payment failures. Please update your payment details to restart your subscription.`;
        break;

      case SubscriptionEndReason.TRIAL_EXPIRED:
        message = `Your trial for the ${plan.name} plan has ended. Subscribe now to continue enjoying premium features.`;
        break;

      case SubscriptionEndReason.COMPLETED:
        message = `Your ${plan.name} subscription has completed its full term and will not renew. Thank you for being with us!`;
        break;

      default:
        message = `Your ${plan.name} subscription has been cancelled.`;
        break;
    }

    return {
      ...(this.resolveBase(subscription) as MailSubscriptionTemplateInfo),
      currency,
      message,
      payment_method,
      amount,
      subject,
    };
  }
}
