import { RedisHealthIndicator } from '@nestjs-modules/ioredis';
import { Controller, Get, Ip } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { CacheHealthIndicator } from 'src/common/cache/cache-health.indicator';
import { IpHealthIndicator } from './ip-health.indicator';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Public()
@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private cache: CacheHealthIndicator,
    private redis: RedisHealthIndicator,
    private ip: IpHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ operationId: 'Health-Check', summary: 'Check health status' })
  @HealthCheck()
  check(@Ip() ipAddr: string) {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      async () => this.cache.isHealthy('cache'),
      async () => this.redis.isHealthy('redis'),
      async () => this.ip.isHealthy('ip', ipAddr),
    ]);
  }
}
