import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { urlSchema } from '../../urls/dto/url.dto';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';

export const channelSchema = baseSchema.extend({
  name: z.string().nonempty(),
  description: z.string().nullable(),
  badge_icon: z.string().nullable(),
  badge_color: z.string().nullable(),
  is_starred: z.boolean().default(false),
});

export const channelDto = zodToCamelCase(channelSchema);

export class ChannelDto extends createZodDto(channelDto) {}

export class ChannelSerializerDto extends createZodDto(channelSchema) {}

export class ChannelResponse extends createResponseDto(channelSchema) {}

export class AllChannelResponse extends createResponseDto(
  channelSchema.array(),
) {}
