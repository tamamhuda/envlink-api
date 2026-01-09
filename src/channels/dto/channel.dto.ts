import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { urlSchema } from '../../urls/dto/url.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';

export const channelSchema = baseSchema.extend({
  name: z.string().nonempty(),
  description: z.string().nullable().optional(),
  badge_icon: z.string().nullable().optional(),
  badge_color: z.string().nullable().optional(),
  is_starred: z.boolean().default(false),
});

export const channelPaginatedSchema = createPaginatedSchema(channelSchema);

export const channelPaginatedDto = zodToCamelCase(channelPaginatedSchema);

export const channelDto = zodToCamelCase(channelSchema);

export class ChannelPaginatedDto extends createZodDto(channelPaginatedDto) {}

export class ChannelPaginatedSerializedDto extends createZodDto(
  channelPaginatedSchema,
) {}

export class ChannelPaginatedResponse extends createResponseDto(
  channelPaginatedSchema,
) {}

export class ChannelDto extends createZodDto(channelDto) {}

export class ChannelSerializerDto extends createZodDto(channelSchema) {}

export class ChannelResponse extends createResponseDto(channelSchema) {}

export class AllChannelResponse extends createResponseDto(
  channelSchema.array(),
) {}
