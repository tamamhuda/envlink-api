import { createZodDto } from 'nestjs-zod';
import { RedirectType } from 'src/common/enums/redirect-type.enum';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const baseShortenUrlSchema = z.object({
  alias: z.string().max(64).optional(),
  original_url: z.string().url().nonempty(),
  description: z.string().nullable().optional(),
  active_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .optional(),
  expires_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .optional(),
  access_code: z.string().nullable().optional(),
  is_protected: z.boolean().default(false).optional(),
  is_private: z.boolean().default(false).optional(),
  redirect_type: z
    .nativeEnum(RedirectType)
    .default(RedirectType.DIRECT)
    .optional(),
  click_limit: z.number().nullable().optional(),
  expiration_redirect: z.string().url().nullable().optional(),
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
      path: ['access_code'],
    },
  ),
);

export const publicShortenUrlSchema = baseShortenUrlSchema
  .pick({
    original_url: true,
  })
  .extend({
    captcha_token: z.string().optional(),
  });

export const publicShortenUrlDto = zodToCamelCase(publicShortenUrlSchema);
export const shortenUrlDto = zodToCamelCase(shortenUrlSchema);

export class ShortenUrlBodyDto extends createZodDto(shortenUrlDto) {}

export class ShortenUrlRequest extends createZodDto(shortenUrlSchema) {}

export class PublicShortenUrlBodyDto extends createZodDto(
  publicShortenUrlDto,
) {}

export class PublicShortenUrlRequest extends createZodDto(
  publicShortenUrlSchema,
) {}
