import { Injectable, Logger } from '@nestjs/common';
import { PlanEnum } from 'src/common/enums/plans.enum';
import Plan from '../entities/plan.entity';
import { PlanRepository } from '../repositories/plan.reposiotry';

@Injectable()
export class PlanSeeder {
  private readonly logger = new Logger(PlanSeeder.name);

  constructor(private readonly planRepo: PlanRepository) {}

  async seed() {
    const plans: Partial<Plan>[] = [
      {
        name: PlanEnum.FREE,
        limit: 100,
        resetInterval: '1d',
        cost: 1,
        description: 'Free plan with 100 daily requests.',
        chargeOnSuccess: false,
        price: 0,
      },
      {
        name: PlanEnum.PRO,
        limit: 1000,
        resetInterval: '1d',
        cost: 9.99,
        description: 'Pro plan with 1000 daily requests.',
        chargeOnSuccess: true,
        price: 19000,
      },
      {
        name: PlanEnum.ENTERPRISE,
        limit: 10000,
        resetInterval: '1h',
        cost: 49.99,
        description: 'Business plan with hourly resets and higher limits.',
        chargeOnSuccess: true,
        price: 39000,
      },
    ];

    //  TypeORM upsert handles both create and update
    await this.planRepo.upsert(plans, ['name']);

    this.logger.log(
      `Seeded or updated ${plans.length} plan(s): ${plans.map((p) => p.name).join(', ')}`,
    );
  }
}
