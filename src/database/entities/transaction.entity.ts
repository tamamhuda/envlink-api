import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { TransactionStatus } from 'src/common/enums/trasaction-status.enum';
import { SubscriptionCycle } from './subscription-cycle.entity';
import { PaymentMethod } from './payment-method.entity';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import Subscription from './subscription.entity';

@Entity({ name: 'transactions' })
@Index(['referenceId'], { unique: true })
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user!: User;

  @ManyToOne(
    () => PaymentMethod,
    (paymentMethod) => paymentMethod.transactions,
    {
      onDelete: 'CASCADE',
    },
  )
  paymentMethod!: PaymentMethod;

  @OneToOne(
    () => SubscriptionCycle,
    (subscription) => subscription.transaction,
    {
      onDelete: 'CASCADE',
      eager: true,
    },
  )
  @JoinColumn()
  subscriptionCycle!: SubscriptionCycle;

  @ManyToOne(() => Subscription, (subscription) => subscription.transactions, {
    onDelete: 'CASCADE',
  })
  subscription!: Subscription;

  @Column({ type: 'varchar' })
  referenceId!: string;

  @Column({ type: 'varchar' })
  productName!: string;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'varchar', nullable: true })
  currency!: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({
    type: 'varchar',
  })
  paymentMethodType!: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.PAYMENT_REQUEST,
  })
  paymentType!: PaymentType;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  failedAt!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  failureCode!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  refundedAt!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  invoiceId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoiceUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoiceNumber!: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoicePdfPath!: string | null;
}
