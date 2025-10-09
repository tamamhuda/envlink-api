import { ConflictException } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

export const shortenUrlSchema = z
  .object({
    code: z.string().max(64).optional(),
    originalUrl: z.string().url().nonempty(),
    isProtected: z.boolean().default(false).optional(),
    accessCode: z.string().optional(),
    expiresAt: z.date().optional(),
  })
  .refine(
    (data) => {
      const { isProtected, accessCode } = data;
      if (isProtected && isProtected == true && !accessCode) return false;
      return true;
    },
    {
      message: 'Access code is required for protected URLs',
      path: ['accessCode'],
    },
  );

export class ShortenUrlDto extends createZodDto(shortenUrlSchema) {}
