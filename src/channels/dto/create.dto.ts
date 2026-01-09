import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { channelSchema } from './channel.dto';
import { createZodDto } from 'nestjs-zod';

export const createChannelSchema = channelSchema.omit({
  created_at: true,
  updated_at: true,
  id: true,
});

export const createChannelDtoSchema = zodToCamelCase(createChannelSchema);

export class CreateChannelBodyDto extends createZodDto(
  createChannelDtoSchema,
) {}

export class CreateChannelRequest extends createZodDto(createChannelSchema) {}
