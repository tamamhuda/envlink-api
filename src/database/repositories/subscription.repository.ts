import { Injectable } from '@nestjs/common';
import Subscription from '../entities/subscription.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
  constructor(dataSource: DataSource) {
    super(Subscription, dataSource.createEntityManager());
  }

  async createOne(data: Subscription): Promise<Subscription> {
    const subscription = this.create(data);
    return this.save(subscription);
  }

  async findOneById(id: string): Promise<Subscription | null> {
    return this.findOne({ where: { id } });
  }

  async updateOne(
    subscription: Subscription,
    data: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const merge = this.merge(subscription, data);
    return this.save(merge);
  }
}
