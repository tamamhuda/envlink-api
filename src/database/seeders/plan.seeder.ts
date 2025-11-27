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
        resetInterval: '24h',
        cost: 0,
        chargeOnSuccess: false,
        price: 0,
        description: 'Essential link shortening tools.',
        features: ['Short Links', 'Custom Aliases', 'Basic Analytics'],
        cta: 'Get Started',
        popular: false,
      },
      {
        name: PlanEnum.STARTER,
        limit: 1000,
        resetInterval: '24h',
        cost: 5,
        chargeOnSuccess: true,
        price: 75000,
        description: 'Grow your personal or small project.',
        features: [
          'All Free features',
          'Batch Links (up to 100)',
          'QR Codes',
          'Simple Geo Targeting',
        ],
        cta: 'Upgrade',
        popular: true,
      },
      {
        name: PlanEnum.PRO,
        limit: 5000,
        resetInterval: '24h',
        cost: 15,
        chargeOnSuccess: true,
        price: 225000,
        description: 'For teams and marketing professionals.',
        features: [
          'All Starter features',
          'Advanced Analytics',
          'Device Targeting',
          'Metadata Fetching',
        ],
        cta: 'Upgrade',
        popular: false,
      },
      {
        name: PlanEnum.ENTERPRISE,
        limit: 10000,
        resetInterval: '24h',
        cost: 0,
        chargeOnSuccess: true,
        price: 0,
        description: 'Full control and scalability with API access.',
        features: [
          'All Pro features',
          'Unlimited Batch Links',
          'Dedicated API Key',
          'Priority Support',
        ],
        cta: 'Contact Sales',
        popular: false,
      },
    ];

    //  TypeORM upsert handles both create and update
    await this.planRepo.upsert(plans, ['name']);

    this.logger.log(
      `Seeded or updated ${plans.length} plan(s): ${plans.map((p) => p.name).join(', ')}`,
    );
  }
}
