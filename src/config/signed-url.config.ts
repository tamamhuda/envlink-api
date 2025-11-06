import { ConfigService } from '@nestjs/config';
import { UrlGeneratorModuleOptions } from 'nestjs-url-generator';
import { Env } from './env.config';

export function getSignedUrlConfig(
  config: ConfigService<Env>,
): UrlGeneratorModuleOptions {
  return {
    secret: config.getOrThrow('APP_SECRET'),
    appUrl: config.getOrThrow('APP_URL'),
  };
}
