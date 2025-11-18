import { createZodDto } from 'nestjs-zod';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

export const urlAnalyticLogSchema = baseSchema.extend({
  ip_address: z.string().ip().nullable(),
  user_agent: z.string().nullable(),
  referrer: z.string().nullable(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  device_type: z.string().nullable(),
  os: z.string().nullable(),
  language: z.string().nullable(),
  is_unique: z.boolean().nullable(),
  browser: z.string().nullable(),
  visitor_count: z.number().min(0),
  url_id: z.string().uuid(),
  channels: z.array(z.string()),
});

export const urlLogDtoSchema = zodToCamelCase(urlAnalyticLogSchema);

export const urlAnalyticLogPaginatedSchema =
  createPaginatedSchema(urlAnalyticLogSchema);

export const urlAnalyticLogPaginatedDto = zodToCamelCase(
  urlAnalyticLogPaginatedSchema,
);

export class UrlAnalyticLogDto extends createZodDto(urlLogDtoSchema) {}

export class UrlAnalyticLogPaginatedDto extends createZodDto(
  urlAnalyticLogPaginatedDto,
) {}

export class UrlAnalyticLogPaginatedSerializerDto extends createZodDto(
  urlAnalyticLogPaginatedSchema,
) {}

export class UrlAnalyticLogPaginatedResponse extends createResponseDto(
  urlAnalyticLogPaginatedSchema,
) {}
