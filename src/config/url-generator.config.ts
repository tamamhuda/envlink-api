import { ConfigService } from '@nestjs/config';
import { UrlGeneratorModuleOptions } from 'nestjs-url-generator';
import { Env } from './env.config';

export function getUrlGeneratorConfig(
  config: ConfigService<Env>,
): UrlGeneratorModuleOptions {
  return {
    secret: config.getOrThrow('APP_SECRET'),
    appUrl: config.getOrThrow('APP_URL'),
  };
}
