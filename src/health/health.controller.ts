import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '@nestjs-modules/ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      async () => this.redis.isHealthy('redis'),
    ]);
  }
}
