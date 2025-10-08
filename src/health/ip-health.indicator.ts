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
  private readonly ipUtil: IpUtil = new IpUtil();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly logger: LoggerService,
  ) {
    this.indicator = this.healthIndicatorService.check(this.key);
  }

  async isHealthy(key = 'ip', ipAddr: string): Promise<HealthIndicatorResult> {
    try {
      if (!ipAddr && key !== this.key) this.indicator.down();
      const ipLocation = await this.ipUtil.getIpLocation(ipAddr);
      return this.indicator.up({ ...ipLocation });
    } catch (error) {
      return this.indicator.down(error);
    }
  }
}
