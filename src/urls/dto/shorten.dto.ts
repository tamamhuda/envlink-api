import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const baseShortenUrlSchema = z.object({
  code: z.string().max(64).optional(),
  original_url: z.string().url().nonempty(),
  is_protected: z.boolean().default(false).optional(),
  access_code: z.string().optional(),
  expires_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .optional(),
  channel_ids: z.array(z.string().uuid().nonempty()).optional(),
});

export const shortenUrlSchema = zodToCamelCase(
  baseShortenUrlSchema.refine(
    (data) => {
      const { is_protected, access_code } = data;
      if (is_protected && is_protected == true && !access_code) return false;
      return true;
    },
    {
      message: 'Access code is required for protected URLs',
      path: ['accessCode'],
    },
  ),
);

export const publicShortenUrlSchema = zodToCamelCase(
  baseShortenUrlSchema.pick({
    original_url: true,
  }),
);

export class ShortenUrlBodyDto extends createZodDto(shortenUrlSchema) {}

export class ShortenUrlRequest extends ShortenUrlBodyDto {}

export class PublicShortenUrlBodyDto extends createZodDto(
  publicShortenUrlSchema,
) {}

export class PublicShortenUrlRequest extends PublicShortenUrlBodyDto {}
