import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HealthIndicatorSession } from '@nestjs/terminus/dist/health-indicator/health-indicator.service';
import { IpUtil } from 'src/common/utils/ip.util';
import LoggerService from 'src/logger/logger.service';

@Injectable()
export class IpHealthIndicator {
  private readonly key = 'ip';
  private readonly indicator: HealthIndicatorSession;

  constructor(
    private readonly ipUtil: IpUtil,
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly logger: LoggerService,
  ) {
    this.indicator = this.healthIndicatorService.check(this.key);
  }

  async isHealthy(key = 'ip', ipAddr: string): Promise<HealthIndicatorResult> {
    try {
      if (!ipAddr && key !== this.key) this.indicator.down();
      await this.ipUtil.getIpGeolocation(ipAddr);
      return this.indicator.up();
    } catch (error) {
      return this.indicator.down(error);
    }
  }
}
