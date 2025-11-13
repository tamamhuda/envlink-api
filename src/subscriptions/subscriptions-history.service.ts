import LoggerService from 'src/common/logger/logger.service';
import { SubscriptionsService } from './subscriptions.service';
import { Injectable } from '@nestjs/common';
import { SubscriptionHistoryRepository } from 'src/database/repositories/subscription-history.repository';

@Injectable()
export class SubscriptionsCyclesService {
  constructor(
    private readonly cycleRepository: SubscriptionHistoryRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly logger: LoggerService,
  ) {}

  getSubscriptionsHistory() {
    return;
  }

  getaAllSubscriptionHistory() {
    return;
  }
}
