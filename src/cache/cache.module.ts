import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from 'src/config/cache.config';
import { CacheHealthIndicator } from './cache-health.indicator';

@Global()
@Module({
  imports: [
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
