import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { CacheService } from 'src/cache/cache.service';
import { HealthIndicatorSession } from '@nestjs/terminus/dist/health-indicator/health-indicator.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheHealthIndicator {
  private readonly key = 'cache';
  private readonly indicator: HealthIndicatorSession;
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.indicator = this.healthIndicatorService.check(this.key);
  }

  async isHealthy(key = 'cache'): Promise<HealthIndicatorResult> {
    try {
      const store = this.cache.stores.find(
        (store) => store.namespace === CachePrefix.APP,
      );
      if (key !== this.key || !store) return this.indicator.down();
      await store.set('PING', 'PONG', 60);
      await store.delete('PING');
      return this.indicator.up();
    } catch (error) {
      return this.indicator.down(error);
    }
  }
}
