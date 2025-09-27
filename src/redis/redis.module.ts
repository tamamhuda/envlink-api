import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import {
  RedisHealthIndicator,
  RedisHealthModule,
} from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [RedisHealthModule],
  providers: [RedisService],
  exports: [RedisService, RedisHealthModule],
})
export class RedisModule {}
