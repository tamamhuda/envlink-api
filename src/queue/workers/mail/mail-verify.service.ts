import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailSubscriptionTemplateInfo,
  MailVerifyTemplateInfo,
} from 'src/common/interfaces/mail.interface';
import { MailUtil } from 'src/common/utils/mail.util';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/common/logger/logger.service';
import { CcBccItem } from 'zeptomail/types';

@Injectable()
export class MailVerifyService {
  private readonly APP_NAME: string;

  constructor(
    private readonly mailUtil: MailUtil,
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    this.APP_NAME = this.config.getOrThrow('APP_NAME');
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

    await this.mailUtil.sendTemplateEmail(
      to,
      'VERIFY_EMAIL',
      mergeInfo,
      'Email Verification',
    );
  }
}
