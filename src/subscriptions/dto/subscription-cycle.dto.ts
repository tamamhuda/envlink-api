import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { RecurringCycleStatus } from 'src/common/enums/recurring-cycle-status.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const subscriptionCycleSchema = baseSchema.extend({
  subscription_id: z.string().uuid().nonempty(),
  action_ids: z.array(z.string()),
  transaction_id: z.string().uuid().nullable(),
  type: z.string().nonempty(),
  status: z.nativeEnum(RecurringCycleStatus),
  payment_link_failed_retry: z.string().nullable(),
  cycle_number: z.number().min(1),
  attempt_count: z.number().min(0),
  failure_code: z.string().nullable(),
  scheduled_date: z
    .string()
    .datetime()
    .transform((date) => new Date(date)),
});

export const subscriptionCycleDtoSchema = zodToCamelCase(
  subscriptionCycleSchema,
);

export class SubscriptionCycleDto extends createZodDto(
  subscriptionCycleDtoSchema,
) {}

export class SubscriptionCycleSerializerDto extends createZodDto(
  subscriptionCycleSchema,
) {}

export class AllSubscriptionCyclesResponse extends createResponseDto(
  z.array(subscriptionCycleSchema),
) {}

export class SubscriptionCycleResponse extends createResponseDto(
  z.array(subscriptionCycleSchema),
) {}
