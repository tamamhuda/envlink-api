import { createZodDto } from 'nestjs-zod';
import { userInfoSchema } from 'src/auth/dto/user-info.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { PeriodEnum } from 'src/common/enums/Period.enum';
import { PlansEnum } from 'src/common/enums/plans.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { UpgradeStrategy } from 'src/common/enums/upgrade-strategy.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';

export const subscriptionInfoSchema = baseSchema.extend({
  referenceId: z.string().nullable(),
  externalId: z.string().nullable(),
  user: userInfoSchema.pick({
    id: true,
    fullName: true,
    email: true,
  }),
  plan: z.object({
    name: z.nativeEnum(PlansEnum),
    limit: z.number().min(1),
    resetInterval: z.string(),
    cost: z.number().min(1),
    chargeOnSuccess: z.boolean().default(false),
    description: z.string().nullable(),
  }),
  startedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  remaining: z.number().min(0),
  period: z.nativeEnum(PeriodEnum),
  interval: z.number().min(1),
  status: z.nativeEnum(SubscriptionStatus),
  isTrial: z.boolean().default(false),
  schedule: z
    .object({
      reference_id: z.string(),
      interval: z.nativeEnum(PeriodEnum),
      interval_count: z.number().min(1),
      anchor_date: z.string().optional(),
    })
    .nullable(),
  metadata: z
    .object({
      strategy: z.nativeEnum(UpgradeStrategy),
      previousPlan: z.nativeEnum(PlansEnum),
      newPlan: z.nativeEnum(PlansEnum),
    })
    .nullable(),
  transactionStatus: z.string().nullable(),
  paymentId: z.string().nullable(),
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

export class SubscriptionInfoDto extends createZodDto(subscriptionInfoSchema) {}

export class SubscriptionInfoResponse extends createResponseDto(
  subscriptionInfoSchema,
) {}
