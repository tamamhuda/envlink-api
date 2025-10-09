import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { urlSchema } from './url.dto';
import { channelSchema } from './channel.dto';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';

export const createAnalyticSchema = z.object({
  identityHash: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  referrer: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  deviceType: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  isUnique: z.boolean().default(false),
});

export const analyticSchema = baseSchema
  .merge(createAnalyticSchema)
  .extend({
    url: urlSchema,
    channel: channelSchema.optional(),
  })
  .omit({
    identityHash: true,
  });
export class CreateAnalyticDto extends createZodDto(createAnalyticSchema) {}

export class AnalyticDto extends createZodDto(analyticSchema) {}

export class AnalyticResponseDto extends createResponseDto(analyticSchema) {}
