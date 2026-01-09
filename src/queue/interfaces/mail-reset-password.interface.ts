export interface SendMailResetPasswordJob {
  firstName: string;
  email: string;
  resetPasswordLink: string;
  ttlMinutes: number;
}
