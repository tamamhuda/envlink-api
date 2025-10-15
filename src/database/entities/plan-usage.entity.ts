import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import Plan from './plan.entity';
import { PlanUsageHistory } from './plan-usage-history.entity';
import Subscription from './subscription.entity';

@Entity({ name: 'plan_usages' })
@Index(['user', 'scope'], { unique: true })
export class PlanUsage extends BaseEntity {
  @ManyToOne(() => User, (user) => user.usages, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Subscription, (sub) => sub.usages, { onDelete: 'CASCADE' })
  subscription!: Subscription;

  @ManyToOne(() => Plan, (plan) => plan.usages, { onDelete: 'CASCADE' })
  plan!: Plan;

  @OneToMany(() => PlanUsageHistory, (history) => history.usage, {
    onDelete: 'CASCADE',
  })
  history!: PlanUsageHistory[];

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  usageIdentity!: string;

  @Column()
  scope!: string;

  @Column({ default: 0 })
  used!: number;

  @Column({ default: 0 })
  remaining!: number;

  @Column({ type: 'timestamptz', nullable: false })
  resetAt!: Date;

  shouldReset(): boolean {
    return new Date() >= new Date(this.resetAt);
  }
}
