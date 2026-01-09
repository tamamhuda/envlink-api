export interface MailVerifyTemplateInfo {
  APP_NAME: string;
  GIVEN_NAME: string;
  VERIFY_URL: string;
  DURATION: string;
  CURRENT_YEAR: string;
  [key: string]: string;
}

export interface MailSubscriptionTemplateInfo {
  payment_method: string;
  amount: string;
  manage_subscription_url: string;
  subject: string;
  help_center_url: string;
  message: string;
  unsubscribe_url: string;
  plan_name: string;
  subscription_id: string;
  support_email: string;
  currency: string;
  customer_name: string;
  billing_cycle: string;
  next_billing_date: string;
  app_name: string;
  [key: string]: string;
}

export interface MailResetPasswordTemplateInfo {
  APP_NAME: string;
  GIVEN_NAME: string;
  RESET_PASSWORD_URL: string;
  DURATION: string;
  CURRENT_YEAR: string;
  [key: string]: string;
}
