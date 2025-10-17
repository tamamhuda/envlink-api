import { PeriodEnum } from '../enums/Period.enum';

/** Base create payload (request body) */
export interface CreateRecurringPlan {
  reference_id: string;
  customer_id: string;
  recurring_action: 'PAYMENT';
  currency: string;
  amount: number;
  schedule: RecurringSchedule;
  payment_methods?: PaymentMethod[];
  immediate_action_type?: 'FULL_AMOUNT';
  notification_config?: NotificationConfig;
  payment_link_for_failed_attempt?: boolean;
  failed_cycle_action?: 'RESUME' | 'STOP';
  metadata?: Record<string, any>;
  description?: string;
  items?: XenditRecurringItem[];
  success_return_url?: string;
  failure_return_url?: string;
}

/** Recurring schedule configuration */
export interface RecurringSchedule {
  reference_id: string;
  interval: PeriodEnum;
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
export interface XenditRecurringPlanCallback {
  event: 'recurring.plan.activated' | 'recurring.plan.inactivated';
  business_id: string;
  created: string;
  data: XenditRecurringPlanData;
}

export enum RecurringStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

/**
 * Core data of the recurring plan callback.
 */
export interface XenditRecurringPlanData {
  reference_id: string;
  customer_id: string;
  recurring_action: 'PAYMENT';
  currency: string;
  amount: number;
  schedule: XenditRecurringSchedule;
  payment_methods: XenditRecurringPaymentMethod[];
  immediate_action_type?: 'FULL_AMOUNT';
  notification_config?: XenditRecurringNotificationConfig;
  locale?: 'en' | 'id';
  payment_link_for_failed_attempt?: boolean;
  failed_cycle_action?: 'RESUME' | 'STOP';
  metadata?: Record<string, any>;
  description?: string;
  items?: XenditRecurringItem[];
  success_return_url?: string;
  failure_return_url?: string;
  id: string;
  status: RecurringStatus;
  actions?: XenditRecurringAction[];
}

/**
 * Schedule definition for recurring payments.
 */
export interface XenditRecurringSchedule {
  reference_id: string;
  interval: 'DAY' | 'WEEK' | 'MONTH';
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
export interface XenditRecurringPaymentMethod {
  payment_method_id: string;
  rank: number;
}

/**
 * Notification configuration for recurring plan.
 */
export interface XenditRecurringNotificationConfig {
  recurring_created?: ('WHATSAPP' | 'EMAIL')[];
  recurring_succeeded?: ('WHATSAPP' | 'EMAIL')[];
  recurring_failed?: ('WHATSAPP' | 'EMAIL')[];
}

/**
 * Recurring item definition.
 */
export interface XenditRecurringItem {
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
export interface XenditRecurringAction {
  action: 'AUTH';
  url_type: 'WEB';
  url: string;
  method: 'GET' | 'POST';
}
