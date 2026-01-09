import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';

import z from 'zod';
import { urlAnalyticStatSchema } from './url-stat.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';

export const urlOverviewSchema = z.object({
  total_visits: z.number().min(0).default(0),
  unique_visitors: z.number().min(0).default(0),
  top_countries: z
    .object({
      country_code: z.string().nonempty(),
      total_visits: z.number(),
    })
    .array()
    .default([]),
  top_urls: urlAnalyticStatSchema.array().default([]),
});

export const urlOverviewDtoSchema = zodToCamelCase(urlOverviewSchema);

export class UrlAnalyticsOverviewDto extends createZodDto(
  urlOverviewDtoSchema,
) {}

export class UrlAnalyticsOverviewSerializerDto extends createZodDto(
  urlOverviewSchema,
) {}

export class UrlAnalyticsOverviewResponse extends createResponseDto(
  urlOverviewSchema,
) {}
