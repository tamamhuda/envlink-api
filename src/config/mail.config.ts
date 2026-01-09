import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';

export type TemplateOption = Record<
  'VERIFY_EMAIL' | 'SUBSCRIPTION' | 'RESET_PASSWORD',
  Record<'KEY' | 'SENDER' | 'NAME', string>
>;

export type MailConfig = {
  url: string;
  token: string;
  template: TemplateOption;
};

export const templateOption = (config: ConfigService<Env>) => ({
  VERIFY_EMAIL: {
    KEY: config.getOrThrow('TEMPLATE_KEY_VERIFY_EMAIL'),
    NAME: 'no-replay Envlink',
    SENDER: config.getOrThrow('SENDER_ADDRESS'),
  },
  SUBSCRIPTION: {
    KEY: config.getOrThrow('TEMPLATE_KEY_SUBSCRIPTION'),
    NAME: 'Envlink Subscription',
    SENDER: config.getOrThrow('SENDER_NOTIFICATION'),
  },
  RESET_PASSWORD: {
    KEY: config.getOrThrow('TEMPLATE_KEY_RESET_PASSWORD'),
    NAME: 'Envlink Password Reset',
    SENDER: config.getOrThrow('SENDER_ADDRESS'),
  },
});

export default function getMailConfig(config: ConfigService<Env>): MailConfig {
  const url = config.getOrThrow('ZEPTO_API_URL');
  const token = config.getOrThrow('ZEPTOMAIL_TOKEN');
  const template = templateOption(config);
  return {
    url,
    token,
    template,
  };
}
