import { createZodDto } from 'nestjs-zod';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { urlSchema } from 'src/urls/dto/url.dto';

export const channelItemsPaginatedSchema = createPaginatedSchema(urlSchema);

export const channelItemsPaginatedDto = zodToCamelCase(
  channelItemsPaginatedSchema,
);

export class ChannelItemsPaginatedDto extends createZodDto(
  channelItemsPaginatedDto,
) {}

export class ChannelItemsPaginatedSerializerDto extends createZodDto(
  channelItemsPaginatedSchema,
) {}

export class ChannelItemsPaginatedResponse extends createResponseDto(
  channelItemsPaginatedSchema,
) {}
