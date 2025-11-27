import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { PlanUsage } from './plan-usage.entity';
import Subscription from './subscription.entity';

@Entity({ name: 'plans' })
@Unique(['name'])
export default class Plan extends BaseEntity {
  @Column({ type: 'enum', enum: PlanEnum, default: PlanEnum.FREE })
  name!: PlanEnum;

  @Column({ type: 'int', default: 100 })
  limit!: number;

  @Column({ type: 'varchar', default: '24h' })
  resetInterval!: string;

  @Column({ type: 'float', default: 1 })
  cost!: number;

  @Column({ type: 'boolean', default: true })
  chargeOnSuccess!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => PlanUsage, (usage) => usage.plan, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  usages!: PlanUsage[];

  @OneToMany(() => Subscription, (subscription) => subscription.plan, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  subscriptions!: Subscription[];

  @Column({ type: 'json', default: [] })
  features!: string[];

  @Column({ type: 'float', default: 0 })
  price!: number;

  @Column({ type: 'varchar', default: 'Get Started' })
  cta!: string;

  @Column({ type: 'boolean', default: false })
  popular!: boolean;
}
