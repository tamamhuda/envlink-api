import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { urlSchema } from './url.dto';
import { channelSchema } from './channel.dto';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';

export const analyticSchema = baseSchema.extend({
  ipAddress: z.string(),
  userAgent: z.string(),
  referrer: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  deviceType: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  url: urlSchema.nullable().optional(),
  channel: channelSchema,
});

export class AnalyticDto extends createZodDto(analyticSchema) {}

export class AnalyticResponseDto extends createResponseDto(analyticSchema) {}
