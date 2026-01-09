import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailResetPasswordTemplateInfo,
  MailSubscriptionTemplateInfo,
  MailVerifyTemplateInfo,
} from 'src/common/interfaces/mail.interface';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { CcBccItem } from 'zeptomail/types';
import { MailService } from 'src/infrastructure/mail/mail.service';

@Injectable()
export class MailResetPasswordService {
  private readonly APP_NAME: string;

  constructor(
    private readonly mailService: MailService,
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    this.APP_NAME = this.config.getOrThrow('APP_NAME');
  }

  async send(
    email: string,
    givenName: string,
    resetPasswordUrl: string,
    ttlMinutes: number,
  ) {
    const mergeInfo: MailResetPasswordTemplateInfo = {
      APP_NAME: this.APP_NAME,
      GIVEN_NAME: givenName,
      RESET_PASSWORD_URL: resetPasswordUrl,
      DURATION: `${ttlMinutes} minutes`,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    };

    const to: CcBccItem[] = [
      {
        email_address: {
          name: givenName,
          address: email,
        },
      },
    ];

    await this.mailService.sendTemplateEmail(
      to,
      'RESET_PASSWORD',
      mergeInfo,
      'Reset Password',
    );
  }
}
