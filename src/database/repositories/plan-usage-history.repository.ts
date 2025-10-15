import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PlanUsage } from '../entities/plan-usage.entity';

@Injectable()
export class PlanUsageRepository extends Repository<PlanUsage> {
  constructor(datasource: DataSource) {
    super(PlanUsage, datasource.createEntityManager());
  }

  async createOne(data: Partial<PlanUsage>): Promise<PlanUsage> {
    const plan = this.create(data);
    return await this.save(plan);
  }
}
