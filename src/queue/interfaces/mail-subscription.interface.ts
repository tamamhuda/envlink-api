import { EmailAddress } from 'zeptomail/types';

export interface SendMailSubscriptionJob {
  event: SubscriptionEventType;
  to: EmailAddress;
  subscriptionId: string;
}

export type SubscriptionEventType =
  | 'subscription.created'
  | 'subscription.upgraded'
  | 'subscription.renewed'
  | 'subscription.renewal_upcoming'
  | 'subscription.payment_failed'
  | 'subscription.deactivated';
