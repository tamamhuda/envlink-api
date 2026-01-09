import { Injectable, NotFoundException } from '@nestjs/common';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { PlanRepository } from 'src/database/repositories/plan.reposiotry';
import { PlanEnum } from 'src/common/enums/plans.enum';

import { PlanDto } from '../dto/plan.dto';

@Injectable()
export class SubscriptionsPlansService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly logger: LoggerService,
  ) {}

  async getAllPlans(): Promise<PlanDto[]> {
    return await this.planRepository.findAll();
  }

  async getPlanByName(name: PlanEnum): Promise<PlanDto> {
    const plan = await this.planRepository.findOneByName(name);
    if (!plan) {
      throw new NotFoundException(`Plan not found`);
    }
    return plan;
  }
}
