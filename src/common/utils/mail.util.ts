import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { MailtrapTransport } from 'mailtrap';
import { createTransport } from 'nodemailer';
import {
  MailtrapMailOptions,
  MailtrapTransporter,
} from 'mailtrap/dist/types/transport';
import LoggerService from 'src/logger/logger.service';
import { MailVerifyTemplateVariable } from '../interfaces/mail.interface';

@Injectable()
export class MailUtil {
  private readonly SENDER: string;
  private readonly TEMPLATE_ID_VERIFY_EMAIL: string;
  private readonly APP_NAME: string;
  private readonly transport: MailtrapTransporter;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    this.SENDER = this.config.getOrThrow('MAIL_SENDER');
    this.TEMPLATE_ID_VERIFY_EMAIL = this.config.getOrThrow(
      'TEMPLATE_ID_VERIFY_EMAIL',
    );
    this.APP_NAME = this.config.getOrThrow('APP_NAME');
    this.transport = createTransport(
      MailtrapTransport({
        token: this.config.getOrThrow('MAILTRAP_TOKEN'),
      }),
    );
  }

  async sendTemplateEmail(
    to: string,
    templateUuid: string,
    templateVariables: MailVerifyTemplateVariable,
    subject?: string,
  ) {
    try {
      const params: MailtrapMailOptions = {
        from: this.SENDER,
        to,
        templateUuid,
        templateVariables,
        subject,
      };

      await this.transport.sendMail(params);
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendVerifyEmail(
    email: string,
    first_name: string,
    verify_link: string,
  ) {
    try {
      const templateVariables: MailVerifyTemplateVariable = {
        APP_NAME: this.APP_NAME,
        FIRST_NAME: first_name,
        VERIFY_LINK: verify_link,
        EXPIRY: '5m',
      };

      const params: MailtrapMailOptions = {
        from: this.SENDER,
        to: email,
        templateUuid: this.TEMPLATE_ID_VERIFY_EMAIL,
        templateVariables,
      };

      await this.transport.sendMail(params).then(() => {
        this.logger.debug(
          `Verification email sent successfully: ${JSON.stringify(params, null, 2)}`,
        );
      });
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      throw error;
    }
  }
}
