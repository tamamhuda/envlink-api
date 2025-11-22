import { Global, Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthIndicatorService, TerminusModule } from '@nestjs/terminus';
import { IpHealthIndicator } from './ip-health.indicator';

@Global()
@Module({
  imports: [TerminusModule],
  providers: [HealthIndicatorService, IpHealthIndicator],
  exports: [HealthIndicatorService],
  controllers: [HealthController],
})
export class HealthModule {}
