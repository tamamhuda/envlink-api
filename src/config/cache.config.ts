import {
  createKeyv,
  RedisClientConnectionType,
  RedisClientOptions,
} from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheManagerOptions } from '@nestjs/cache-manager';
import ms from 'ms';
import { StringValue } from 'ms';
import { CachePrefix } from '../common/enums/cache-prefix.enum';
import { Env } from './env.config';
import { RedisOptions } from 'ioredis';

export const getRedisConfig = (
  config: ConfigService<Env>,
  db: number = 0,
): RedisClientOptions => {
  const options: RedisOptions = {
    port: config.getOrThrow('REDIS_PORT'),
    host: config.getOrThrow('REDIS_HOST'),
    db: db,
  };
  return {
    url: `redis://${options.host}:${options.port}/${options.db}`,
  };
};

export const getCacheConfig = (
  config: ConfigService<Env>,
): CacheManagerOptions => {
  const redis = getRedisConfig(config);
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
