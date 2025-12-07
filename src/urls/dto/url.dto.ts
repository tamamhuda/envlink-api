import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { channelSchema } from '../../channels/dto/channel.dto';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { createPaginatedSchema } from 'src/common/dto/paginated.dto';
import { RedirectType } from '../../common/enums/redirect-type.enum';

const metadataSchema = z
  .object({
    title: z.string().max(255).nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().url().nullable().optional(),
    favicon: z.string().url().nullable().optional(),
    site_name: z.string().max(255).nullable().optional(),
  })
  .catchall(z.any());

const updateMetadataDtoSchema = zodToCamelCase(
  metadataSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  }),
);

export const urlSchema = baseSchema.extend({
  code: z.string().max(64),
  alias: z.string().max(64).nullable().optional().optional(),
  original_url: z.string().url().nonempty(),
  description: z.string().nullable().optional(),
  is_anonymous: z.boolean().default(true),
  is_protected: z.boolean().default(false),
  access_code: z.string().nullable().optional(),
  active_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .nullable()
    .optional(),
  expires_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .nullable()
    .optional(),
  click_count: z.number().min(0).default(0),
  unique_clicks: z.number().min(0).default(0),
  is_private: z.boolean().default(false),
  is_archived: z.boolean().default(false),
  archived_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .nullable()
    .optional(),
  redirect_type: z.nativeEnum(RedirectType).default(RedirectType.DIRECT),
  expiration_redirect: z.string().url().nullable().optional(),
  click_limit: z.number().nullable().optional(),
  metadata: metadataSchema.nullable().optional(),
  channels: z.array(
    channelSchema.pick({ id: true, name: true, description: true }),
  ),
});

export const urlDtoSchema = zodToCamelCase(urlSchema);

const publicUrlSchema = urlSchema.omit({
  id: true,
  access_code: true,
  channels: true,
});
const publicUrlDtoSchema = zodToCamelCase(publicUrlSchema);

const updateUrlSchema = urlSchema
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

const updateUrlDtoSchema = zodToCamelCase(updateUrlSchema);

const unlockUrlDtoSchema = zodToCamelCase(
  z.object({
    access_code: z.string().nonempty(),
  }),
);

export class UnlockUrlBodyDto extends createZodDto(unlockUrlDtoSchema) {}

export class UnlockUrlRequest extends UnlockUrlBodyDto {}

export class PublicUrlDto extends createZodDto(publicUrlDtoSchema) {}

export class PublicUrlSerializerDto extends createZodDto(publicUrlSchema) {}

export class PublicUrlResponse extends createResponseDto(publicUrlSchema) {}

export class UpdateUrlBodyDto extends createZodDto(updateUrlDtoSchema) {}

export class UpdateUrlRequest extends createZodDto(updateUrlSchema) {}

export class UpdateMetadataDto extends createZodDto(updateMetadataDtoSchema) {}

export class UrlDto extends createZodDto(urlDtoSchema) {}

export class UrlSerializerDto extends createZodDto(urlSchema) {}

export class UrlResponse extends createResponseDto(urlSchema) {}

export class AllUrlsResponse extends createResponseDto(urlSchema.array()) {}

export const urlPaginatedSchema = createPaginatedSchema(urlSchema);

export const urlPaginatedDtoSchema = zodToCamelCase(urlPaginatedSchema);

export class UrlPaginatedDto extends createZodDto(urlPaginatedDtoSchema) {}

export class UrlPaginatedSerializerDto extends createZodDto(
  urlPaginatedSchema,
) {}

export class UrlPaginatedResponse extends createResponseDto(
  urlPaginatedSchema,
) {}
