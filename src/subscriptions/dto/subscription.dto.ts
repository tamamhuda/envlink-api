import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { SubscriptionInterval } from 'src/common/enums/Period.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { planSchema } from './plan.dto';

export const subscriptionInfoSchema = baseSchema.extend({
  reference_id: z.string().nullable(),
  external_id: z.string().nullable(),
  user_id: z.string().uuid(),
  plan: planSchema,
  started_at: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .nullable(),
  expires_at: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .nullable(),
  remaining: z.number().min(0),
  status: z.nativeEnum(SubscriptionStatus),
  is_trial: z.boolean().default(false),
  schedule: z
    .object({
      interval: z.nativeEnum(SubscriptionInterval),
      interval_count: z.number().min(1),
      total_recurrence: z.number().min(1),
    })
    .nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  transaction_status: z.string().nullable(),
  next_billing_date: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .nullable()
    .optional(),
  actions: z
    .array(
      z.object({
        action: z.string(),
        url_type: z.string(),
        url: z.string().url(),
        method: z.string().default('GET'),
      }),
    )
    .optional(),
});

const subscriptionInfoDtoSchema = zodToCamelCase(subscriptionInfoSchema);

export class SubscriptionInfoDto extends createZodDto(
  subscriptionInfoDtoSchema,
) {}

export class SubscriptionInfoSerializerDto extends createZodDto(
  subscriptionInfoSchema,
) {}

export class SubscriptionInfoResponse extends createResponseDto(
  subscriptionInfoSchema,
) {}

export class AllSubscriptionInfoResponse extends createResponseDto(
  subscriptionInfoSchema.array(),
) {}
