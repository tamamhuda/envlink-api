import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SubscriptionHistory } from '../entities/subscription-history.entity';

@Injectable()
export class SubscriptionHistoryRepository extends Repository<SubscriptionHistory> {
  constructor(dataSource: DataSource) {
    super(SubscriptionHistory, dataSource.createEntityManager());
  }

  async createOne(
    data: Partial<SubscriptionHistory>,
  ): Promise<SubscriptionHistory> {
    const history = this.create(data);
    return this.save(history);
  }

  // async findAllHistorysBySubscriptionId(
  //   subscriptionId: string,
  // ): Promise<SubscriptionHistory[]> {
  //   return this.find({
  //     where: { subscription: { id: subscriptionId } },
  //     relations: ['subscription', 'subscription.user', 'transaction'],
  //   });
  // }

  // async findOneHistorysBySubscriptionId(
  //   subscriptionId: string,
  //   cycleId: string,
  // ): Promise<SubscriptionHistory | null> {
  //   return this.findOne({
  //     where: { subscription: { id: subscriptionId }, id: cycleId },
  //     relations: ['subscription', 'subscription.user', 'transaction'],
  //   });
  // }
}
