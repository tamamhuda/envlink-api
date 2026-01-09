import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { metadataSchema, urlSchema } from './url.dto';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateUrlSchema = urlSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    click_count: true,
    channels: true,
  })
  .extend({
    channels_ids: z.array(z.string().uuid()).optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

const updateMetadataDtoSchema = zodToCamelCase(
  metadataSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  }),
);

const updateUrlDtoSchema = zodToCamelCase(updateUrlSchema);

export class UpdateUrlBodyDto extends createZodDto(updateUrlDtoSchema) {}

export class UpdateUrlRequest extends createZodDto(updateUrlSchema) {}

export class UpdateMetadataDto extends createZodDto(updateMetadataDtoSchema) {}
