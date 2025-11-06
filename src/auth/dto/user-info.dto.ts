import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { userBaseSchema } from 'src/user/dto/user.dto';
import * as z from 'zod';

export const providerSchema = z.object({
  provider: z.nativeEnum(ProviderEnum).default(ProviderEnum.LOCAL),
  is_verified: z.boolean().default(false),
});

export const userInfoSchema = userBaseSchema.extend({
  providers: providerSchema,
  last_login_at: z.date().or(z.string()).optional().nullable(),
});

export const userInfoDtoSchema = zodToCamelCase(userInfoSchema);

export type UserInfo = z.infer<typeof userInfoDtoSchema>;

export class UserInfoDto extends createZodDto(userInfoDtoSchema) {}

export class UserInfoSerializer extends createZodDto(userInfoSchema) {}

export class UserInfoResponse extends createResponseDto(userInfoSchema) {}
