import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { createZodDto } from 'nestjs-zod';
import { createChannelSchema } from './create.dto';

export const updateChannelSchema = createChannelSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    path: ['body'],
    message: 'Provide at least one field to update',
  });

export const updateChannelDtoSchema = zodToCamelCase(updateChannelSchema);

export class UpdateChannelBodyDto extends createZodDto(
  updateChannelDtoSchema,
) {}

export class UpdateChannelRequest extends createZodDto(updateChannelSchema) {}
