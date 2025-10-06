import { Global, Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthIndicatorService, TerminusModule } from '@nestjs/terminus';

@Global()
@Module({
  imports: [TerminusModule],
  providers: [HealthIndicatorService],
  exports: [HealthIndicatorService],
  controllers: [HealthController],
})
export class HealthModule {}
