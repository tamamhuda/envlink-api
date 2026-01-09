import { createZodDto } from 'nestjs-zod';
import { userInfoSchema } from 'src/auth/dto/user-info.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import * as z from 'zod';

export const sessionInfoSchema = baseSchema.extend({
  user_agent: z.string().max(255).optional().nullable(),
  ip_location: z.string().max(255).optional().nullable(),
  is_revoked: z.boolean().default(false),
  is_current: z.boolean().default(false),
  device_type: z.string().max(32).optional().nullable(),
  os: z.string().max(64).optional().nullable(),
  browser: z.string().max(64).optional().nullable(),
  revoked_at: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .nullable(),
  expires_at: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .nullable(),
  user: userInfoSchema,
});

export const sessionInfoDtoSchema = zodToCamelCase(sessionInfoSchema);

export class SessionInfoDto extends createZodDto(sessionInfoDtoSchema) {}

export class SessionInfoSerializerDto extends createZodDto(sessionInfoSchema) {}

export class SessionInfoResponse extends createResponseDto(sessionInfoSchema) {}

export class AllSessionsInfoResponse extends createResponseDto(
  sessionInfoSchema.array(),
) {}
