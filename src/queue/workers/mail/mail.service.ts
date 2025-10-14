import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailVerifyTemplateVariable } from 'src/common/interfaces/mail.interface';
import { MailUtil } from 'src/common/utils/mail.util';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/common/logger/logger.service';

@Injectable()
export class MailService {
  private readonly TEMPLATE_ID_VERIFY_EMAIL: string;
  private readonly APP_NAME: string;

  constructor(
    private readonly mailUtil: MailUtil,
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    this.TEMPLATE_ID_VERIFY_EMAIL = this.config.getOrThrow(
      'TEMPLATE_ID_VERIFY_EMAIL',
    );
    this.APP_NAME = this.config.getOrThrow('APP_NAME');
  }

  async sendVerifyEmail(email: string, firstName: string, verifyLink: string) {
    const templateVariables: MailVerifyTemplateVariable = {
      APP_NAME: this.APP_NAME,
      FIRST_NAME: firstName,
      VERIFY_LINK: verifyLink,
      EXPIRY: '5m',
    };

    await this.mailUtil.sendTemplateEmail(
      email,
      this.TEMPLATE_ID_VERIFY_EMAIL,
      templateVariables,
      'Email Verification',
    );
  }
}
