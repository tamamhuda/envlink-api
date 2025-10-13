import { Injectable, Logger } from '@nestjs/common';
import { PlansEnum } from 'src/common/enums/plans.enum';
import Plan from 'src/database/entities/plan.entity';
import { PlanRepository } from 'src/database/repositories/plan.reposiotry';

@Injectable()
export class PlanSeeder {
  private readonly logger = new Logger(PlanSeeder.name);

  constructor(private readonly planRepo: PlanRepository) {}

  async seed() {
    const existingPlans = await this.planRepo.find();
    const existingNames = new Set(existingPlans.map((p) => p.name));

    const plans: Partial<Plan>[] = [
      {
        name: PlansEnum.FREE,
        limit: 100,
        resetInterval: '1d',
        cost: 0,
        description: 'Free plan with 100 daily requests.',
        chargeOnSuccess: false,
      },
      {
        name: PlansEnum.PRO,
        limit: 1000,
        resetInterval: '1d',
        cost: 9.99,
        description: 'Pro plan with 1000 daily requests.',
        chargeOnSuccess: true,
      },
      {
        name: PlansEnum.ENTERPRISE,
        limit: 10000,
        resetInterval: '1h',
        cost: 49.99,
        description: 'Business plan with hourly resets and higher limits.',
        chargeOnSuccess: true,
      },
    ];

    const newPlans = plans.filter(
      (plan: Plan) => !existingNames.has(plan.name),
    );

    if (newPlans.length === 0) {
      this.logger.log('All plans already exist, skipping seeding.');
      return;
    }

    await this.planRepo.save(newPlans);
    this.logger.log(
      `Seeded ${newPlans.length} new plan(s): ${newPlans.map((p) => p.name).join(', ')}`,
    );
  }
}
