import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { z } from 'zod';
export const urlTimelineSchema = z.object({
  total_visits: z.number().min(0),
  unique_visits: z.number().min(0),
  timestamp: z
    .string()
    .datetime()
    .transform((value) => new Date(value)),
});

export const urlTimelineDtoSchema = zodToCamelCase(urlTimelineSchema);

export class UrlAnalyticTimelineDto extends createZodDto(
  urlTimelineDtoSchema,
) {}

export class UrlAnalyticTimelineSerializerDto extends createZodDto(
  urlTimelineSchema,
) {}

export class AllUrlAnalyticTimelineSerializerDto extends createResponseDto(
  urlTimelineSchema.array(),
) {}

export class UrlAnalyticTimelineResponse extends createResponseDto(
  urlTimelineSchema.array(),
) {}
