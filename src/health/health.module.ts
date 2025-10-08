import { Global, Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthIndicatorService, TerminusModule } from '@nestjs/terminus';
import { RedisHealthModule } from '@nestjs-modules/ioredis';
import { IpHealthIndicator } from './ip-health.indicator';

@Global()
@Module({
  imports: [TerminusModule, RedisHealthModule],
  providers: [HealthIndicatorService, IpHealthIndicator],
  exports: [HealthIndicatorService],
  controllers: [HealthController],
})
export class HealthModule {}
