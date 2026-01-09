import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';

import z from 'zod';

export const visitSchema = z.object({
  total: z.number().min(0).default(0),
  unique: z.number().min(0).default(0),
});

export const segmentsSchema = z.object({
  device_visits: z
    .array(
      visitSchema.extend({
        device: z.string(),
      }),
    )
    .default([]),
  os_visits: z
    .array(
      visitSchema.extend({
        os: z.string(),
      }),
    )
    .default([]),
  browser_visits: z
    .array(
      visitSchema.extend({
        browser: z.string(),
      }),
    )
    .default([]),
  country_visits: z
    .array(
      visitSchema.extend({
        country_code: z.string(),
      }),
    )
    .default([]),
  referrer_visits: z
    .array(
      visitSchema.extend({
        referrer: z.string(),
      }),
    )
    .default([]),
  region_visits: z
    .array(
      visitSchema.extend({
        region: z.string(),
        country_code: z.string(),
      }),
    )
    .default([]),
  city_visits: z
    .array(visitSchema.extend({ city: z.string(), country_code: z.string() }))
    .default([]),
});

const segmentsDtoSchema = zodToCamelCase(segmentsSchema);

export class UrlAnalyticsSegmentsDto extends createZodDto(segmentsDtoSchema) {}

export class UrlAnalyticsSegmentsSerializedDto extends createZodDto(
  segmentsSchema,
) {}

export class UrlAnalyticsSegmentsResponse extends createResponseDto(
  segmentsDtoSchema,
) {}
