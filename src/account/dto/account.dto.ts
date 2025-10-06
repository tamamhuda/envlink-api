import { createZodDto } from 'nestjs-zod';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import * as z from 'zod';

export const accountSchema = z.object({
  provider: z.nativeEnum(ProviderEnum).default(ProviderEnum.LOCAL),
  providerAccountId: z.string().nonempty(),
  providerEmail: z.string().email().optional(),
  providerUsername: z.string().optional(),
  passwordHash: z.string().optional(),
  isVerified: z.boolean().default(false),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export class AccountDto extends createZodDto(accountSchema) {}
