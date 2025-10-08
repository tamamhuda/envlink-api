import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';

const metadataSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  favicon: z.string().url().optional(),
  siteName: z.string().max(255).optional(),
});

const updateMetadataSchema = metadataSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const urlSchema = baseSchema.extend({
  code: z.string().max(64),
  originalUrl: z.string().url().nonempty(),
  isAnonymous: z.boolean().default(true),
  isProtected: z.boolean().default(false),
  accessCode: z.string().nullable(),
  expiresAt: z.date().nullable(),
  clickCount: z.number().min(0).default(0),
  metadata: metadataSchema.nullable(),
});

const publicUrlSchema = urlSchema.omit({
  id: true,
  accessCode: true,
});

const updateUrlSchema = urlSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    clickCount: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

const unlockUrlSchema = z.object({
  accessCode: z.string().nonempty(),
});

export class UnlockUrlDto extends createZodDto(unlockUrlSchema) {}

export class PublicUrlDto extends createZodDto(publicUrlSchema) {}

export class PublicUrlResponse extends createResponseDto(publicUrlSchema) {}

export class UpdateUrlDto extends createZodDto(updateUrlSchema) {}

export class UpdateMetadataDto extends createZodDto(updateMetadataSchema) {}

export class UrlDto extends createZodDto(urlSchema) {}

export class UrlResponse extends createResponseDto(urlSchema) {}

export class UrlsResponse extends createResponseDto(urlSchema.array()) {}
