import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { urlSchema } from './url.dto';
import { channelSchema } from './channel.dto';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';

export const baseAnalythicSchema = z.object({
  ip_address: z.string(),
  user_agent: z.string(),
  referrer: z.string(),
  country: z.string(),
  region: z.string(),
  city: z.string(),
  device_type: z.string(),
  os: z.string(),
  browser: z.string(),
  language: z.string(),
  is_unique: z.boolean().default(false),
});

export const createAnalyticSchema = baseAnalythicSchema.extend({
  identity_hash: z.string(),
});

export const analyticSchema = baseSchema.merge(baseAnalythicSchema).extend({
  url: urlSchema,
  channel: channelSchema.optional(),
});

const analyticDtoSchema = zodToCamelCase(analyticSchema);

const createAnalyticDtoSchema = zodToCamelCase(createAnalyticSchema);

export class CreateAnalyticDto extends createZodDto(createAnalyticDtoSchema) {}

export class AnalyticDto extends createZodDto(analyticDtoSchema) {}

export class AnalyticSerializerDto extends createZodDto(analyticSchema) {}

export class AnalyticResponseDto extends createResponseDto(analyticSchema) {}
