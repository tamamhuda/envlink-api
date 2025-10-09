import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig, getRedisConfig } from 'src/config/cache.config';
import { CacheHealthIndicator } from './cache-health.indicator';
import { RedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRedisConfig,
    }),

    // Cache Manager with Redis as Cache Store
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),
  ],
  providers: [CacheService, CacheHealthIndicator],
  exports: [CacheService, CacheHealthIndicator],
})
export class CacheModule {}
