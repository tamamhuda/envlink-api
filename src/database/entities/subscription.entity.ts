import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import Plan from './plan.entity';
import { User } from './user.entity';
import { PlanUsage } from './plan-usage.entity';
import { SubscriptionInterval } from 'src/common/enums/Period.enum';
import ms, { StringValue } from 'ms';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { SubscriptionCycle } from './subscription-cycle.entity';
import { Transaction } from './transaction.entity';
import { SubscriptionEndReason } from 'src/common/enums/subscription-end-reason.enum';

@Entity({ name: 'subscriptions' })
@Index(['referenceId', 'externalId'])
export default class Subscription extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  externalId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  referenceId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  remaining!: number;

  @Column({
    type: 'enum',
    enum: SubscriptionInterval,
    default: SubscriptionInterval.DAY,
  })
  interval!: SubscriptionInterval;

  @Column({ type: 'int', default: 1 })
  intervalCount!: number;

  @Column({ type: 'int', default: 12 })
  totalRecurrence!: number;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'boolean', default: false })
  isTrial!: boolean;

  @Column({ type: 'float', default: 0 })
  amountPaid!: number;

  @Column({ type: 'float', default: 0 })
  amount!: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: {
    strategy: UpgradeStrategy;
    previousPlan: PlanEnum;
    newPlan: PlanEnum;
    previousExternalId: string | null;
    [key: string]: any;
  } | null;

  @Column({ type: 'varchar', nullable: true })
  transactionStatus!: string | null;

  @Column({ type: 'int', default: 1 })
  currentCycle!: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextBillingDate!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  failureCode!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancellationDate!: Date | null;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ type: 'enum', enum: SubscriptionEndReason, nullable: true })
  endReason!: SubscriptionEndReason | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  plan!: Plan;

  @OneToMany(
    () => SubscriptionCycle,
    (subscriptionCycle) => subscriptionCycle.subscription,
    {
      onDelete: 'CASCADE',
    },
  )
  subscriptionCycles!: SubscriptionCycle[];

  @OneToMany(() => Transaction, (transaction) => transaction.subscription, {
    onDelete: 'CASCADE',
  })
  transactions!: Transaction[];

  @OneToMany(() => PlanUsage, (planUsage) => planUsage.subscription, {
    cascade: true,
  })
  usages!: PlanUsage[];

  /**
   * Assigns subscription period dates and calculates remaining usage
   * based on the plan’s reset interval, limit, and subscription period.
   */
  initializeSubscriptionPeriod() {
    this.startedAt = new Date();
    this.status = SubscriptionStatus.ACTIVE;

    // Set expiry based on subscription period
    switch (this.interval) {
      case SubscriptionInterval.DAY:
        this.expiresAt = addDays(this.startedAt, this.intervalCount);
        break;
      case SubscriptionInterval.MONTH:
        this.expiresAt = addMonths(this.startedAt, this.intervalCount);
        break;
      case SubscriptionInterval.YEAR:
        this.expiresAt = addYears(this.startedAt, this.intervalCount);
        break;
      default:
        this.expiresAt = addDays(this.startedAt, 30);
        break;
    }

    // Calculate number of resets within the subscription period
    const resetIntervalDays = this.parseIntervalToDays(this.plan.resetInterval);
    const totalDays = differenceInDays(this.expiresAt, this.startedAt);
    const resets = Math.max(1, Math.floor(totalDays / resetIntervalDays));

    // Total remaining per interval = resets * plan.limit
    this.remaining = resets * this.plan.limit;
  }

  private parseIntervalToDays(interval: string): number {
    const msValue = ms(interval as StringValue);
    return msValue / (1000 * 60 * 60 * 24);
  }

  assignReferenceId(): string {
    this.referenceId = `${this.plan.name}-${this.id}-${Date.now()}`;
    return this.referenceId;
  }
}
