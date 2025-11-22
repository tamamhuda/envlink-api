import { ConfigService } from '@nestjs/config';
import { CacheManagerOptions } from '@nestjs/cache-manager';
import ms from 'ms';
import { StringValue } from 'ms';
import { CachePrefix } from '../common/enums/cache-prefix.enum';
import { Env } from './env.config';
import { createKeyv } from '@keyv/redis';
import { RedisClientConfig } from '@quazex/nestjs-ioredis';

export const getRedisConfig = (
  config: ConfigService<Env>,
  db: number = 0,
): RedisClientConfig => {
  return {
    port: config.getOrThrow('REDIS_PORT'),
    host: config.getOrThrow('REDIS_HOST'),
    db: db,
  };
};

export const getCacheConfig = (
  config: ConfigService<Env>,
): CacheManagerOptions => {
  const redis = getRedisConfig(config);
  const ttl = ms(config.get<Env['CACHE_TTL']>('CACHE_TTL') as StringValue);

  const stores = Object.values(CachePrefix).map((namespace) =>
    createKeyv(redis.uri, {
      namespace,
      keyPrefixSeparator: `:`,
    }),
  );

  return {
    stores,
    ttl,
  };
};
