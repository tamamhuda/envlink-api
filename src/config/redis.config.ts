import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { RedisOptions } from 'ioredis';

export const getRedisClientConfig = (
  config: ConfigService<Env>,
  db: number,
): RedisOptions => {
  return {
    port: config.get<Env['REDIS_PORT']>('REDIS_PORT'),
    host: config.get<Env['REDIS_HOST']>('REDIS_HOST'),
    db: db,
  };
};

export const getRedisConfig = (
  config: ConfigService<Env>,
): RedisModuleOptions => {
  const redis = getRedisClientConfig(config, 0);
  return {
    type: 'single',
    options: redis,
  };
};
