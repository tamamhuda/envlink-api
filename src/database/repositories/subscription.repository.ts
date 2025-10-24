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
    return this.findOne({ where: { id }, relations: ['user', 'plan'] });
  }

  async findOneByReferenceId(
    referenceId: string,
  ): Promise<Subscription | null> {
    return this.findOne({
      where: { referenceId },
      relations: ['user', 'plan'],
    });
  }

  async findOneByExternalId(externalId: string): Promise<Subscription | null> {
    return this.findOne({
      where: { externalId },
      relations: [
        'user',
        'user.activeSubscription',
        'user.activeSubscription.plan',
        'plan',
      ],
    });
  }

  async findOneByUserId(userId: string): Promise<Subscription | null> {
    return this.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'plan'],
    });
  }

  async findOneByUserExternalId(
    userExternalId: string,
  ): Promise<Subscription | null> {
    return this.findOne({
      where: { user: { externalId: userExternalId } },
      relations: ['user', 'plan'],
    });
  }

  async updateOne(
    subscription: Subscription,
    data: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const merge = this.merge(subscription, data);
    return this.save(merge);
  }
}
