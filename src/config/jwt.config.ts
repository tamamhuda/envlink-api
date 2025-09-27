import { ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { Env } from './env.config';

export const getJwtConfig = (
  config: ConfigService<Env>,
): Record<'accessToken' | 'refreshToken', JwtSignOptions> => {
  return {
    accessToken: {
      secret: config.get<Env['JWT_ACCESS_SECRET']>('JWT_ACCESS_SECRET', {
        infer: true,
      }),
      expiresIn: config.get<Env['JWT_ACCESS_EXPIRES_IN']>(
        'JWT_ACCESS_EXPIRES_IN',
        { infer: true },
      ),
    },
    refreshToken: {
      secret: config.get<Env['JWT_REFRESH_SECRET']>('JWT_REFRESH_SECRET', {
        infer: true,
      }),
      expiresIn: config.get<Env['JWT_REFRESH_EXPIRES_IN']>(
        'JWT_REFRESH_EXPIRES_IN',
        { infer: true },
      ),
    },
  };
};
