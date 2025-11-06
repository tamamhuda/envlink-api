import { createZodDto } from 'nestjs-zod';
import { SubscriptionInterval } from 'src/common/enums/Period.enum';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const upgradeSubscriptionDtoSchema = zodToCamelCase(
  z.object({
    plan: z.nativeEnum(PlanEnum),
    strategy: z
      .nativeEnum(UpgradeStrategy)
      .default(UpgradeStrategy.UPGRADE_IMMEDIATELY),
    amount: z.number().nonnegative().min(0).optional(),
    discount: z.number().nonnegative().min(0).optional(),
    schedule: z.object({
      interval: z
        .nativeEnum(SubscriptionInterval)
        .default(SubscriptionInterval.MONTH),
      interval_count: z.number().min(1).default(1),
      total_recurrence: z.number().min(1).default(12),
    }),
    description: z.string().nonempty(),
  }),
);

export class UpgradeSubscriptionDto extends createZodDto(
  upgradeSubscriptionDtoSchema,
) {}
