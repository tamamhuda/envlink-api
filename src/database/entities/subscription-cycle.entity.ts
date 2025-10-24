import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import Subscription from './subscription.entity';
import { Transaction } from './transaction.entity';
import { RecurringCycleStatus } from 'src/common/enums/recurring-cycle-status.enum';

@Entity({ name: 'subscription_cycles' })
@Index(['externalId'], { unique: true })
export class SubscriptionCycle extends BaseEntity {
  @Column({ type: 'varchar' })
  externalId!: string;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.subscriptionCycles,
    {
      onDelete: 'CASCADE',
    },
  )
  subscription!: Subscription;

  @Column('text', { array: true, default: [] })
  actionIds!: string[];

  @OneToOne(() => Transaction, (transaction) => transaction.subscriptionCycle, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  transaction!: Transaction | null;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'enum', enum: RecurringCycleStatus })
  status!: RecurringCycleStatus;

  @Column({ type: 'int' })
  cycleNumber!: number;

  @Column({ type: 'int' })
  attemptCount!: number;

  @Column({ type: 'varchar', nullable: true })
  failureCode!: string | null;

  @Column({ type: 'timestamp' })
  scheduledDate!: Date;
}
