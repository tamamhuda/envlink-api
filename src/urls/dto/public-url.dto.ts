import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { urlSchema } from './url.dto';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';

export const publicUrlSchema = urlSchema.pick({
  code: true,
  alias: true,
  original_url: true,
  is_private: true,
  expires_at: true,
  active_at: true,
  expiration_redirect: true,
  click_limit: true,
  metadata: true,
  redirect_type: true,
  is_protected: true,
});

export const publicUrlDtoSchema = zodToCamelCase(publicUrlSchema);

export class PublicUrlDto extends createZodDto(publicUrlDtoSchema) {}

export class PublicUrlSerializerDto extends createZodDto(publicUrlSchema) {}

export class PublicUrlResponse extends createResponseDto(publicUrlSchema) {}
