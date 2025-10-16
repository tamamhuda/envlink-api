import { JwtSignOptions } from '@nestjs/jwt';
import { Env } from './env.config';
import { ConfigService } from '@nestjs/config';

function JwtConfigOptions(config: ConfigService<Env>) {
  return {
    access: {
      secret: config.getOrThrow<Env['JWT_ACCESS_SECRET']>('JWT_ACCESS_SECRET'),
      expiresIn: config.getOrThrow<Env['JWT_ACCESS_EXPIRES_IN']>(
        'JWT_ACCESS_EXPIRES_IN',
      ),
    },
    refresh: {
      secret:
        config.getOrThrow<Env['JWT_REFRESH_SECRET']>('JWT_REFRESH_SECRET'),
      expiresIn: config.getOrThrow<Env['JWT_REFRESH_EXPIRES_IN']>(
        'JWT_REFRESH_EXPIRES_IN',
      ),
    },
  };
}

export function getJwtOptions(
  config: ConfigService<Env>,
  type: 'access' | 'refresh',
): JwtSignOptions {
  const jwtOptions = JwtConfigOptions(config);
  return jwtOptions[type];
}

export const JWT_ACCESS_STRATEGY = 'jwt';
export const JWT_REFRESH_STRATEGY = 'jwt-refresh';
export const JWT_SECURITY = 'jwt-access';
export const JWT_REFRESH_SECURITY = 'jwt-refresh';
