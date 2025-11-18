import { createZodDto } from 'nestjs-zod';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';

import { urlSchema } from 'src/urls/dto/url.dto';
import z from 'zod';
export const visitSchema = z.object({
  total: z.number().min(0).default(0),
  unique: z.number().min(0).default(0),
});

export const statBreakdownSchema = z.object({
  device_visits: z.record(z.string(), visitSchema).nullable(),
  os_visits: z.record(z.string(), visitSchema).nullable(),
  browser_visits: z.record(z.string(), visitSchema).nullable().default({}),
  country_visits: z
    .array(
      visitSchema.extend({
        country: z.string(),
      }),
    )
    .nullable()
    .default([]),
});

export const urlAnalyticStatSchema = z
  .object({
    url: urlSchema.pick({
      id: true,
      code: true,
      original_url: true,
      channels: true,
      metadata: true,
    }),
    total_visit: z.number().min(0).default(0),
    unique_visitors: z.number().min(0).default(0),
    first_visit: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .nullable(),
    last_visit: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .nullable(),
  })
  .merge(statBreakdownSchema);

export const urlAnalyticStatDtoSchema = zodToCamelCase(urlAnalyticStatSchema);

export class UrlAnalyticStatDto extends createZodDto(
  urlAnalyticStatDtoSchema,
) {}

export class UrlAnalyticStatSerializerDto extends createZodDto(
  urlAnalyticStatSchema,
) {}

export class UrlAnalyticStatResponse extends createResponseDto(
  urlAnalyticStatSchema,
) {}

export type UrlAnalyticStat = z.infer<typeof urlAnalyticStatDtoSchema>;

export const urlStaticSchemaPaginated = createPaginatedSchema(
  urlAnalyticStatSchema,
);

export const urlStaticSchemaPaginatedDtoSchema = zodToCamelCase(
  urlStaticSchemaPaginated,
);

export class UrlAnalyticStatPaginatedDto extends createZodDto(
  urlStaticSchemaPaginatedDtoSchema,
) {}

export class UrlAnalyticStatPaginatedSerializerDto extends createZodDto(
  urlStaticSchemaPaginated,
) {}

export class UrlAnalyticStatPaginatedResponse extends createResponseDto(
  urlStaticSchemaPaginated,
) {}
