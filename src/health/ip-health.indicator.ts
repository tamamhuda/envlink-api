import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

import { HealthIndicatorSession } from '@nestjs/terminus/dist/health-indicator/health-indicator.service';
import { IpService } from 'src/infrastructure/internal-services/request/ip.service';
import LoggerService from 'src/infrastructure/logger/logger.service';

@Injectable()
export class IpHealthIndicator {
  private readonly key = 'ip';
  private readonly indicator: HealthIndicatorSession;

  constructor(
    private readonly ipService: IpService,
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly logger: LoggerService,
  ) {
    this.indicator = this.healthIndicatorService.check(this.key);
  }

  async isHealthy(key = 'ip', ipAddr: string): Promise<HealthIndicatorResult> {
    try {
      if (!ipAddr && key !== this.key) this.indicator.down();
      await this.ipService.getIpGeolocation(ipAddr);
      return this.indicator.up();
    } catch (error) {
      return this.indicator.down(error);
    }
  }
}
