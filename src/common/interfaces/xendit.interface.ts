import { PaymentMethodStatus } from '../enums/payment-method-status.enum';
import { PaymentMethodType } from '../enums/payment-method-type.enum';
import { SubscriptionInterval } from '../enums/Period.enum';
import { PlanEnum } from '../enums/plans.enum';
import { RecurringCycleStatus } from '../enums/recurring-cycle-status.enum';
import { RecurringCycleType } from '../enums/recurring-cycle-type.enum';
import { UpgradeStrategy } from '../enums/upgrade-strategy.enum';

/** Base create payload (request body) */
export interface CreateRecurringPlan {
  reference_id: string;
  customer_id: string;
  recurring_action: RecurringActionType;
  currency: string;
  amount: number;
  schedule: RecurringSchedule;
  payment_methods?: PaymentMethod[];
  immediate_action_type?: 'FULL_AMOUNT';
  notification_config?: NotificationConfig;
  payment_link_for_failed_attempt?: boolean;
  failed_cycle_action?: 'RESUME' | 'STOP';
  metadata: {
    strategy: UpgradeStrategy;
    previousPlan: PlanEnum;
    newPlan: PlanEnum;
  };
  description?: string;
  items?: RecurringItem[];
  success_return_url?: string;
  failure_return_url?: string;
}

/** Recurring schedule configuration */
export interface RecurringSchedule {
  reference_id: string;
  interval: SubscriptionInterval;
  interval_count: number;
  total_recurrence?: number | null;
  anchor_date?: string;
  retry_interval?: 'DAY';
  retry_interval_count?: number;
  total_retry?: number;
  failed_attempt_notifications?: number[];
}

/** Payment method info */
export interface PaymentMethod {
  payment_method_id: string;
  rank?: number;
}

/** Notification channel preferences */
export interface NotificationConfig {
  recurring_created?: ('WHATSAPP' | 'EMAIL')[];
  recurring_succeeded?: ('WHATSAPP' | 'EMAIL')[];
  recurring_failed?: ('WHATSAPP' | 'EMAIL')[];
  locale?: 'en' | 'id';
}

/** Response: 201 Created recurring plan */
export interface RecurringPaymentResponse extends CreateRecurringPlan {
  id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  actions?: RecurringPlanAction[];
  created?: string;
  updated?: string;
}

/** End-user action link */
export interface RecurringPlanAction {
  type?: string;
  url: string;
  expires_at?: string;
}

/**
 * Xendit Recurring Plan Callback
 * Replaces all "Webhook" references with "Callback"
 */
export interface RecurringPlanCallback {
  event: 'recurring.plan.activated' | 'recurring.plan.inactivated';
  business_id: string;
  created: string;
  data: RecurringPlanData;
}

export enum RecurringStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export type RecurringActionType = 'PAYMENT' | 'INVOICE' | string;

/**
 * Core data of the recurring plan callback.
 */
export interface RecurringPlanData {
  reference_id: string;
  customer_id: string;
  recurring_action: RecurringActionType;
  currency: string;
  amount: number;
  schedule: RecurringSchedule;
  payment_methods: RecurringPaymentMethod[];
  immediate_action_type?: 'FULL_AMOUNT';
  notification_config?: RecurringNotificationConfig;
  locale?: 'en' | 'id';
  payment_link_for_failed_attempt?: boolean;
  failed_cycle_action?: 'RESUME' | 'STOP';
  metadata?: Record<string, any>;
  description?: string;
  items?: RecurringItem[];
  success_return_url?: string;
  failure_return_url?: string;
  id: string;
  status: RecurringStatus;
  actions?: RecurringAction[];
  failure_code?: string;
}

/**
 * Schedule definition for recurring payments.
 */
export interface RecurringSchedule {
  reference_id: string;
  interval: SubscriptionInterval;
  interval_count: number;
  total_recurrence?: number | null;
  anchor_date?: string;
  retry_interval?: 'DAY';
  retry_interval_count?: number;
  total_retry?: number;
  failed_attempt_notifications?: number[];
}

/**
 * Payment method definition for recurring plan.
 */
export interface RecurringPaymentMethod {
  payment_method_id: string;
  rank: number;
}

/**
 * Notification configuration for recurring plan.
 */
export interface RecurringNotificationConfig {
  recurring_created?: ('WHATSAPP' | 'EMAIL')[];
  recurring_succeeded?: ('WHATSAPP' | 'EMAIL')[];
  recurring_failed?: ('WHATSAPP' | 'EMAIL')[];
}

/**
 * Recurring item definition.
 */
export interface RecurringItem {
  type:
    | 'DIGITAL_PRODUCT'
    | 'PHYSICAL_PRODUCT'
    | 'DIGITAL_SERVICE'
    | 'PHYSICAL_SERVICE'
    | 'FEE'
    | 'DISCOUNT';
  name: string;
  net_unit_amount: number;
  quantity: number;
  url?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Possible user-facing actions for completing recurring plan setup.
 */
export interface RecurringAction {
  action: 'AUTH';
  url_type: 'WEB';
  url: string;
  method: 'GET' | 'POST';
}

export type RecurringCycleEvent =
  | 'recurring.cycle.created'
  | 'recurring.cycle.retrying'
  | 'recurring.cycle.succeeded'
  | 'recurring.cycle.failed';

export type RecurringPaymentLink = {
  invoice_id: string;
  payment_link_url: string;
};

export interface RecurringCycleAttempt {
  /** Type of attempt (e.g., INITIAL, RETRY) */
  type: string;

  /** Status of the attempt */
  status: RecurringCycleStatus | 'INITIAL' | string;

  /** Creation timestamp */
  created: string;

  /** Action ID associated with this attempt */
  action_id: string | null;

  /** Optional failure code if attempt failed */
  failure_code: string | null;

  /** Optional payment link if generated */
  payment_link: RecurringPaymentLink | null;

  /** Attempt sequence number */
  attempt_number: number;

  /** Action number for tracking (internal) */
  action_number: number;

  /** Optional timestamp for next retry */
  next_retry_timestamp: string | null;
}

export interface RecurringCycleData {
  /** Unique recurring cycle ID */
  id: string;

  /** Cycle type (e.g., IMMEDIATE) */
  type: RecurringCycleType;

  /** Amount billed for this cycle */
  amount: number;

  /** Current cycle status */
  status: RecurringCycleStatus;

  /** Creation timestamp */
  created: string;

  /** Update timestamp */
  updated: string;

  /** Associated plan ID */
  plan_id: string;

  /** Customer ID */
  customer_id: string;

  /** Reference ID provided by client */
  reference_id: string;

  /** Currency (e.g., IDR) */
  currency: string;

  /** Metadata if any */
  metadata: Record<string, any> | null;

  /** Cycle number in sequence */
  cycle_number: number;

  /** Recurring action type (e.g., PAYMENT) */
  recurring_action: RecurringActionType;

  /** Scheduled timestamp for this cycle */
  scheduled_timestamp: string;

  /** Number of forced attempts */
  forced_attempt_count: number;

  /** Total attempt count */
  attempt_count: number;

  /** Array of attempt details */
  attempt_details: RecurringCycleAttempt[];
}

export interface RecurringCycleCallback {
  /** Webhook event name */
  event: RecurringCycleEvent;

  /** Xendit business ID */
  business_id: string;

  /** ISO 8601 timestamp of webhook creation */
  created: string;

  /** API version (e.g., v1) */
  api_version: string;

  /** Data payload with recurring cycle details */
  data: RecurringCycleData;
}

export interface PaymentMethodCallback {
  event:
    | 'payment_method.activated'
    | 'payment_method.failed'
    | 'payment_method.expired';
  data: PaymentMethodData;
  created: string;
  business_id: string;
}

export interface PaymentMethodData {
  id: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  actions: any[];
  country: string;
  created: string;
  updated: string;
  metadata: {
    default?: boolean;
    custom_name?: string;
    [key: string]: any;
  } | null;
  customer_id: string;
  description: string | null;
  reusability: 'MULTIPLE_USE' | 'SINGLE_USE';
  failure_code?: string | null;
  reference_id: string;
  billing_information?: any | null;

  // Payment method objects
  card?: CardObject | null;
  direct_debit?: DirectDebitObject | null;
  ewallet?: EWalletObject | null;
  over_the_counter?: OverTheCounterObject | null;
  qr_code?: QRObject | null;
  virtual_account?: VirtualAccountObject | null;
  direct_bank_transfer?: any | null;
}

export interface CardObject {
  currency: string;
  channel_properties: {
    skip_three_d_secure?: boolean | null;
    success_return_url: string;
    failure_return_url: string;
    cardonfile_type?: string | null;
  };
  card_information: {
    token_id: string;
    masked_card_number: string;
    cardholder_name: string | null;
    expiry_month: string;
    expiry_year: string;
    type: string;
    network: string;
    country: string;
    issuer: string;
    fingerprint: string;
    cardholder_email?: string;
    cardholder_phone_number?: string;
  };
  card_verification_results: {
    address_verification_result?: string | null;
    cvv_result?: string | null;
    three_d_secure?: {
      eci_code: string;
      three_d_secure_flow: string;
      three_d_secure_result: string;
      three_d_secure_result_reason?: string | null;
      three_d_secure_version: string;
    };
  };
  card_data_id?: string | null;
  is_cvn_submitted?: boolean | null;
}

export interface DirectDebitObject {
  type: 'BANK_ACCOUNT' | 'DEBIT_CARD';
  debit_card?: any | null;
  bank_account?: {
    bank_account_hash: string;
    masked_bank_account_number: string;
  } | null;
  channel_code: string;
  channel_properties: {
    failure_return_url: string;
    success_return_url: string;
  };
}

export interface EWalletObject {
  account: {
    name: string;
    balance?: number | null;
    point_balance?: number | null;
    account_details: string;
  };
  channel_code: string;
  channel_properties: {
    failure_return_url: string;
    success_return_url: string;
  };
}

export interface OverTheCounterObject {
  amount: number;
  currency: string;
  channel_code: string;
  channel_properties: {
    payment_code: string;
    customer_name: string;
    expires_at: string;
  };
}

export interface QRObject {
  amount: number;
  channel_code: string;
  channel_properties: {
    expires_at: string;
    qr_string: string;
  };
  currency: string;
}

export interface VirtualAccountObject {
  amount: number;
  currency: string;
  channel_code: string;
  channel_properties: {
    customer_name: string;
    expires_at: string;
    virtual_account_number: string;
  };
  alternative_displays?: {
    type: string;
    data: string;
  }[];
}
