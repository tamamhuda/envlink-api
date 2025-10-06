import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { CacheService } from 'src/cache/cache.service';
import { HealthIndicatorSession } from '@nestjs/terminus/dist/health-indicator/health-indicator.service';

@Injectable()
export class CacheHealthIndicator {
  private readonly key = 'redis';
  private readonly indicator: HealthIndicatorSession;
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly cache: CacheService,
  ) {
    this.indicator = this.healthIndicatorService.check('redis');
  }

  async isHealthy(key = 'redis'): Promise<HealthIndicatorResult> {
    try {
      const store = await this.cache.getStore(CachePrefix.APP);
      if (key !== this.key || !store) return this.indicator.down();
      await this.cache.set(CachePrefix.APP, 'ping', { ttl: 10 });
      return this.indicator.up();
    } catch (error) {
      return this.indicator.down(error);
    }
  }
}
