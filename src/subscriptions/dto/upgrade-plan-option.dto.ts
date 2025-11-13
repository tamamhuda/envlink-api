import * as z from 'zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { createZodDto } from 'nestjs-zod';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { planSchema } from './plan.dto';

export const upgradeOptionsSchema = z.object({
  strategy: z.nativeEnum(UpgradeStrategy),
  upgradable: z.boolean(),
  current_plan: z.nativeEnum(PlanEnum),
  new_plan: z.nativeEnum(PlanEnum),
  amount: z.number().min(0),
  discount: z.number().min(0),
  remaining_days: z.number().min(0),
  remaining_credit: z.number().min(0),
  net_amount: z.number().min(0),
});

export const upgradePlanOptionSchema = baseSchema.merge(planSchema).extend({
  upgradable: z.boolean(),
  options: z.array(upgradeOptionsSchema),
});

const upgradePlanOptionDtoSchema = zodToCamelCase(upgradePlanOptionSchema);

export class UpgradePlanOptionDto extends createZodDto(
  upgradePlanOptionDtoSchema,
) {}

export class SubscriptionUpgradeOptionSerializerDto extends createZodDto(
  upgradePlanOptionSchema,
) {}

export class SubscriptionUpgradeOptionsResponse extends createResponseDto(
  upgradePlanOptionSchema.array(),
) {}

const upgradeOptionsDtoSchema = zodToCamelCase(upgradeOptionsSchema);

export class UpgradeOptionsDto extends createZodDto(upgradeOptionsDtoSchema) {}

export class UpgradeOptionsResponse extends createResponseDto(
  z.array(upgradeOptionsSchema),
) {}
