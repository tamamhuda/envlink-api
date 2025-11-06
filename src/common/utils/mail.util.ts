import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import LoggerService from 'src/common/logger/logger.service';
import { SendMailClient } from 'zeptomail';
import { CcBccItem, EmailAddress } from 'zeptomail/types';
import getMailConfig, { TemplateOption } from 'src/config/mail.config';

@Injectable()
export class MailUtil {
  private readonly client = SendMailClient;
  private readonly template: TemplateOption;

  constructor(
    config: ConfigService<Env>,
    private readonly logger: LoggerService,
  ) {
    const { template, token, url } = getMailConfig(config);
    this.client = new SendMailClient({ url, token });
    this.template = template;
  }

  async sendTemplateEmail(
    to: CcBccItem[],
    template: 'VERIFY_EMAIL' | 'SUBSCRIPTION',
    merge_info: Record<string, string>,
    subject: string,
  ) {
    try {
      const {
        KEY: mail_template_key,
        NAME: name,
        SENDER: address,
      } = this.template[template];

      const from: EmailAddress = {
        name,
        address,
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
