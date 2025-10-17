import { createZodDto } from 'nestjs-zod';
import { PeriodEnum } from 'src/common/enums/Period.enum';
import { PlansEnum } from 'src/common/enums/plans.enum';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import * as z from 'zod';

export const upgradeSubscriptionSchema = z.object({
  strategy: z
    .nativeEnum(UpgradeStrategy)
    .default(UpgradeStrategy.UPGRADE_IMMEDIATELY),
  newPlan: z.nativeEnum(PlansEnum),
  amount: z.number().nonnegative().min(0),
  discount: z.number().nonnegative().min(0).optional(),
  schedule: z.object({
    period: z.nativeEnum(PeriodEnum).default(PeriodEnum.MONTH),
    interval: z.number().min(1).default(1),
  }),
  description: z.string().nonempty(),
});

export class UpgradeSubscriptionDto extends createZodDto(
  upgradeSubscriptionSchema,
) {}
