export interface MailVerifyTemplateVariable {
  APP_NAME: string;
  FIRST_NAME: string;
  VERIFY_LINK: string;
  EXPIRY: string;
  [key: string]: string;
}
