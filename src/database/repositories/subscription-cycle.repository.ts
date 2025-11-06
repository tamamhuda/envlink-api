import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SubscriptionCycle } from '../entities/subscription-cycle.entity';

@Injectable()
export class SubscriptionCycleRepository extends Repository<SubscriptionCycle> {
  constructor(dataSource: DataSource) {
    super(SubscriptionCycle, dataSource.createEntityManager());
  }

  async findAllCyclesBySubscriptionId(
    subscriptionId: string,
  ): Promise<SubscriptionCycle[]> {
    return this.find({
      where: { subscription: { id: subscriptionId } },
      relations: ['subscription', 'subscription.user', 'transaction'],
    });
  }

  async findOneCyclesBySubscriptionId(
    subscriptionId: string,
    cycleId: string,
  ): Promise<SubscriptionCycle | null> {
    return this.findOne({
      where: { subscription: { id: subscriptionId }, id: cycleId },
      relations: ['subscription', 'subscription.user', 'transaction'],
    });
  }

  async findOneCycleBySubscriptionIdAndCycleNumber(
    subscriptionId: string,
    cycleNumber: number,
  ): Promise<SubscriptionCycle | null> {
    return this.findOne({
      where: { subscription: { id: subscriptionId }, cycleNumber },
      relations: ['subscription', 'subscription.user', 'transaction'],
    });
  }
}
