import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PlansEnum } from 'src/common/enums/plans.enum';
import { PlanUsage } from './plan-usage.entity';
import Subscription from './subscription.entity';

@Entity({ name: 'plans' })
export default class Plan extends BaseEntity {
  @Column({ type: 'enum', enum: PlansEnum, default: PlansEnum.FREE })
  name!: PlansEnum;

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
}
