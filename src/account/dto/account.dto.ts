import { createZodDto } from 'nestjs-zod';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { userBaseSchema } from 'src/user/dto/user.dto';
import * as z from 'zod';

export const accountSchema = z.object({
  user: userBaseSchema,
  provider: z.nativeEnum(ProviderEnum).default(ProviderEnum.LOCAL),
  provider_account_id: z.string().nonempty(),
  provider_email: z.string().email().optional(),
  provider_username: z.string().optional(),
  is_verified: z.boolean().default(false),
  last_login_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .optional(),
});

export const accountDtoSchema = zodToCamelCase(accountSchema);

export class AccountDto extends createZodDto(accountDtoSchema) {}

export class AccountSerializerDto extends createZodDto(accountSchema) {}
