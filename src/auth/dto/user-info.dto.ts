import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';

export const providerSchema = z.object({
  provider: z.nativeEnum(ProviderEnum).default(ProviderEnum.LOCAL),
  isVerified: z.boolean().default(false),
});

export const userInfoSchema = baseSchema.extend({
  email: z.string().email().nonempty(),
  username: z.string().min(2).max(100).nonempty(),
  fullName: z.string().min(2).max(100).nonempty(),
  avatar: z.string().url().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  role: z.nativeEnum(RolesEnum).default(RolesEnum.USER),
  providers: providerSchema,
  lastLoginAt: z.date().optional().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type UserInfo = z.infer<typeof userInfoSchema>;

export class UserInfoDto extends createZodDto(userInfoSchema) {}

export class UserInfoResponse extends createResponseDto(userInfoSchema) {}
