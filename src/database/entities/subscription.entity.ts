import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import Plan from './plan.entity';
import { User } from './user.entity';
import { PlanUsage } from './plan-usage.entity';
import { PeriodEnum } from 'src/common/enums/Period.enum';
import ms, { StringValue } from 'ms';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';

@Entity({ name: 'subscriptions' })
export default class Subscription extends BaseEntity {
  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  plan!: Plan;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  remaining!: number;

  @Column({ type: 'enum', enum: PeriodEnum, default: PeriodEnum.MONTH })
  period!: PeriodEnum;

  @Column({ type: 'int', default: 1 })
  interval!: number;

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

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: {
    strategy: UpgradeStrategy;
    previous_plan: string;
    new_plan: string;
  } | null;

  @Column({ type: 'varchar', nullable: true })
  paymentId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  transactionStatus!: string | null;

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

    // Set expiry based on subscription period
    switch (this.period) {
      case PeriodEnum.MONTH:
        this.expiresAt = addMonths(this.startedAt, this.interval);
        break;
      case PeriodEnum.YEAR:
        this.expiresAt = addYears(this.startedAt, this.interval);
        break;
      default:
        this.expiresAt = addDays(this.startedAt, 30);
        break;
    }

    // Calculate number of resets within the subscription period
    const resetIntervalDays = this.parseIntervalToDays(this.plan.resetInterval);
    const totalDays = differenceInDays(this.expiresAt, this.startedAt);
    const resets = Math.max(1, Math.floor(totalDays / resetIntervalDays));

    // Total remaining = resets * plan.limit
    this.remaining = resets * this.plan.limit;
  }

  private parseIntervalToDays(interval: string): number {
    const msValue = ms(interval as StringValue); // e.g. 604800000 ms (7 days)
    return msValue / (1000 * 60 * 60 * 24);
  }
}
