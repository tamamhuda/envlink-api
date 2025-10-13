import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PlanUsage } from './plan-usage.entity';

@Entity({ name: 'plan_usage_history' })
export class PlanUsageHistory extends BaseEntity {
  @ManyToOne(() => PlanUsage, (usage) => usage.history, { onDelete: 'CASCADE' })
  usage!: PlanUsage;

  @Column({ type: 'int', default: 0 })
  used!: number;

  @Column({ type: 'varchar', length: 50 })
  action!: string; // e.g. "pre-charge", "charge-success", "reset", "blocked"
}
