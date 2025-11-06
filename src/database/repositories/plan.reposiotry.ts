import { Injectable } from '@nestjs/common';
import Plan from '../entities/plan.entity';
import { DataSource, Repository } from 'typeorm';
import { PlanEnum } from 'src/common/enums/plans.enum';

@Injectable()
export class PlanRepository extends Repository<Plan> {
  constructor(datasource: DataSource) {
    super(Plan, datasource.createEntityManager());
  }

  async createOne(data: Partial<Plan>): Promise<Plan> {
    const plan = this.create(data);
    return await this.save(plan);
  }

  async findOneByName(name: PlanEnum): Promise<Plan | null> {
    return await this.findOne({ where: { name } });
  }

  async findAll(): Promise<Plan[]> {
    return await this.find();
  }
}
