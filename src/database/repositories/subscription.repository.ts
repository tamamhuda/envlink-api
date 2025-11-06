import { Injectable } from '@nestjs/common';
import Subscription from '../entities/subscription.entity';
import { DataSource, Repository } from 'typeorm';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';

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

  async findOneByUserIdAndStatus(
    userId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription | null> {
    return this.findOne({
      where: { user: { id: userId }, status },
      relations: ['user', 'plan'],
    });
  }

  async findOneByIdAndUserId(
    userId: string,
    id: string,
  ): Promise<Subscription | null> {
    return this.findOne({
      where: { id: id, user: { id: userId } },
      relations: ['user', 'user.activeSubscription', 'plan'],
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
