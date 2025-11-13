import { createZodDto } from 'nestjs-zod';
import { PlanEnum } from 'src/common/enums/plans.enum';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const planSchema = z.object({
  name: z.nativeEnum(PlanEnum),
  limit: z.number().min(1),
  reset_interval: z.string(),
  cost: z.number().min(0),
  charge_on_success: z.boolean().default(false),
  description: z.string().nullable(),
  price: z.number().min(0),
  features: z.array(z.string()).min(1),
});

export const planDtoSchema = zodToCamelCase(planSchema);

export class PlanDto extends createZodDto(planDtoSchema) {}

export class PlanSerializerDto extends createZodDto(planSchema) {}

export class PlanResponse extends createZodDto(planSchema) {}

export class ListAllPlansResponse extends createZodDto(planSchema.array()) {}
