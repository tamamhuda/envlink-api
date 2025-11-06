import { Entity, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import Subscription from './subscription.entity';
import { SubscriptionHistoryType } from 'src/common/enums/subscription-history-type.enum';
import { SubscriptionHistoryStatus } from 'src/common/enums/subscription-history-status.enum';
import { BaseEntity } from './base.entity';

@Entity('subscription_histories')
export class SubscriptionHistory extends BaseEntity {
  @ManyToOne(() => User, (user) => user.subscriptionHistories, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Subscription, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  previousSubscription!: Subscription | null;

  @ManyToOne(() => Subscription, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  newSubscription!: Subscription | null;

  @Column({
    type: 'enum',
    enum: SubscriptionHistoryType,
  })
  type!: SubscriptionHistoryType;

  @Column({
    type: 'enum',
    enum: SubscriptionHistoryStatus,
    default: SubscriptionHistoryStatus.PENDING,
  })
  status!: SubscriptionHistoryStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;
}
