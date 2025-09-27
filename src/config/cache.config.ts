import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheManagerOptions } from '@nestjs/cache-manager';
import { getRedisClientConfig } from './redis.config';
import ms from 'ms';
import { StringValue } from 'ms';
import { CachePrefix } from '../common/enums/cache-prefix.enum';
import { Env } from './env.config';

export const getCacheConfig = (
  config: ConfigService<Env>,
): CacheManagerOptions => {
  const redisConfig = getRedisClientConfig(config, 1);
  const redis = `redis://${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`;
  const ttl = ms(config.get<Env['CACHE_TTL']>('CACHE_TTL') as StringValue);

  const stores = Object.values(CachePrefix).map((namespace) =>
    createKeyv(redis, {
      namespace,
      keyPrefixSeparator: ':',
    }),
  );

  return {
    stores,
    ttl,
  };
};
