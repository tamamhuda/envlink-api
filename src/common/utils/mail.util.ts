import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/common/logger/logger.service';
import { SendMailClient } from 'zeptomail';
import { CcBccItem, EmailAddress } from 'zeptomail/types';

@Injectable()
export class MailUtil {
  private readonly SENDER_ADDRESS: string;
  private readonly client = SendMailClient;
  private readonly template: Record<'VERIFY_EMAIL' | 'SUBSCRIPTION', string>;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    this.SENDER_ADDRESS = config.getOrThrow('SENDER_ADDRESS');
    const url = config.getOrThrow('ZEPTO_API_URL');
    const token = config.getOrThrow('ZEPTOMAIL_TOKEN');
    this.client = new SendMailClient({ url, token });
    this.template = {
      VERIFY_EMAIL: config.getOrThrow('TEMPLATE_KEY_VERIFY_EMAIL'),
      SUBSCRIPTION: '',
    };
  }

  async sendTemplateEmail(
    to: CcBccItem[],
    template: 'VERIFY_EMAIL' | 'SUBSCRIPTION',
    merge_info: Record<string, string>,
    subject: string,
  ) {
    try {
      const mail_template_key = this.template[template];
      const from: EmailAddress = {
        name: 'no-reply Envlink',
        address: this.SENDER_ADDRESS,
      };

      await this.client
        .sendMailWithTemplate({
          mail_template_key,
          from,
          to,
          subject,
          merge_info,
        })
        .catch((error: any) =>
          this.logger.error(JSON.stringify(error, null, 2)),
        );
    } catch (error) {
      throw new Error(error);
    }
  }
}
