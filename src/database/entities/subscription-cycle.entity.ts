import { Column, Entity, Index, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import Subscription from './subscription.entity';
import { Transaction } from './transaction.entity';
import { RecurringCycleStatus } from 'src/common/enums/recurring-cycle-status.enum';
import { RecurringCycleType } from 'src/common/enums/recurring-cycle-type.enum';
import { PaymentMethod } from './payment-method.entity';
import { PaymentType } from 'src/common/enums/payment-type.enum';

@Entity({ name: 'subscription_cycles' })
@Index(['externalId'], { unique: true })
export class SubscriptionCycle extends BaseEntity {
  @Column({ type: 'varchar' })
  externalId!: string;

  @Column({ type: 'varchar', nullable: true })
  referenceId!: string | null;

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
  transaction!: Transaction | null;

  @ManyToOne(
    () => PaymentMethod,
    (paymentMethod) => paymentMethod.subscriptionCycles,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  paymentMethod!: PaymentMethod | null;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.PAYMENT_REQUEST,
  })
  paymentType!: PaymentType;

  @Column({
    type: 'enum',
    enum: RecurringCycleType,
    default: RecurringCycleType.IMMEDIATE,
  })
  type!: RecurringCycleType;

  @Column({ type: 'enum', enum: RecurringCycleStatus })
  status!: RecurringCycleStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentLinkFailedRetry!: string | null;

  @Column({ type: 'int' })
  cycleNumber!: number;

  @Column({ type: 'int' })
  attemptCount!: number;

  @Column({ type: 'varchar', nullable: true })
  failureCode!: string | null;

  @Column({ type: 'timestamp' })
  scheduledDate!: Date;

  @Column({ type: 'varchar', nullable: true })
  invoiceId!: string | null;
}
