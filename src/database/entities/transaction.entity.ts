import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { TransactionStatus } from 'src/common/enums/trasaction-status.enum';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';
import { SubscriptionCycle } from './subscription-cycle.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
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
  subscriptionCycle!: SubscriptionCycle;

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
    type: 'enum',
    enum: PaymentMethodType,
  })
  paymentMethodType!: PaymentMethodType;

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
  invoiceUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoiceNumber!: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoicePdfPath!: string | null;
}
