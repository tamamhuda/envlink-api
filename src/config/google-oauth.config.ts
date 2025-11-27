import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';

export const getGoogleOauthConfig = (
  config: ConfigService<Env>,
): {
  clientId: string;
  clientSecret: string;
  callbackUri: string;
  scope: string[];
} => {
  return {
    clientId: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
    callbackUri: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
    scope: ['profile', 'email'],
  };
};
