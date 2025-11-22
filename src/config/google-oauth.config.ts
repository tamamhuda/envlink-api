import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';

export const getGoogleOauthConfig = (config: ConfigService<Env>) => {
  return {
    clientID: config.getOrThrow('GOOGLE_CLIENT_ID'),
    clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
    callbackURL: config.getOrThrow('GOOGLE_CALLBACK_URL'),
    scope: ['profile', 'email'],
  };
};
