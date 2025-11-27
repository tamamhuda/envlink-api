import { createZodDto } from 'nestjs-zod';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';

import { urlSchema } from 'src/urls/dto/url.dto';
import z from 'zod';
import { segmentsSchema } from './segments.dto';

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
  .merge(segmentsSchema);

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
