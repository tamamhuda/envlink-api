import { Controller, Get, Ip } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheHealthIndicator } from 'src/infrastructure/cache/cache-health.indicator';
import { Public } from 'src/security/decorators/public.decorator';
import { IpHealthIndicator } from './ip-health.indicator';

@Public()
@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private cache: CacheHealthIndicator,
    private ip: IpHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ operationId: 'Health-Check', summary: 'Check health status' })
  @HealthCheck()
  check(@Ip() ipAddr: string) {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      async () => this.cache.isHealthy('cache'),
      async () => this.ip.isHealthy('ip', ipAddr),
    ]);
  }
}
