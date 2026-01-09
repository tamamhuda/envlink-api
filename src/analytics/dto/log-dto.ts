import { createZodDto } from 'nestjs-zod';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { urlSchema } from 'src/urls/dto/url.dto';
import z from 'zod';

export const urlAnalyticLogSchema = baseSchema.extend({
  referrer: z.string().nullable().optional(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  country_code: z.string().nullable(),
  device_type: z.string().nullable(),
  os: z.string().nullable(),
  language: z.string().nullable(),
  is_unique: z.boolean().nullable(),
  browser: z.string().nullable(),
  url: urlSchema.omit({ channels: true }),
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
