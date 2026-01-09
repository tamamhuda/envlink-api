import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailSubscriptionTemplateInfo,
  MailVerifyTemplateInfo,
} from 'src/common/interfaces/mail.interface';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { CcBccItem } from 'zeptomail/types';
import { MailService } from 'src/infrastructure/mail/mail.service';

@Injectable()
export class MailVerifyService {
  private readonly APP_NAME: string;

  constructor(
    private readonly mailService: MailService,
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    const app: string = this.config.getOrThrow('APP_NAME');
    this.APP_NAME = app.charAt(0).toUpperCase() + app.slice(1).toLowerCase();
  }

  async sendVerifyEmail(email: string, givenName: string, verifyUrl: string) {
    const mergeInfo: MailVerifyTemplateInfo = {
      APP_NAME: this.APP_NAME,
      GIVEN_NAME: givenName,
      VERIFY_URL: verifyUrl,
      DURATION: '5 minutes',
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
      'VERIFY_EMAIL',
      mergeInfo,
      'Email Verification',
    );
  }
}
