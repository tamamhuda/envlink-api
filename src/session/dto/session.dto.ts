import { createZodDto } from 'nestjs-zod';
import { userInfoSchema } from 'src/auth/dto/user-info.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const sessionInfoSchema = baseSchema.extend({
  user_agent: z.string().max(255).optional().nullable(),
  ip_location: z.string().max(255).optional().nullable(),
  is_revoked: z.boolean().default(false),
  revoked_at: z.date().optional().nullable(),
  expires_at: z.date().optional().nullable(),
  user: userInfoSchema,
});

export const sessionInfoDtoSchema = zodToCamelCase(sessionInfoSchema);

export class SessionInfoDto extends createZodDto(sessionInfoDtoSchema) {}

export class SessionInfoSerializerDto extends createZodDto(sessionInfoSchema) {}

export class SessionInfoResponse extends createResponseDto(sessionInfoSchema) {}

export class AllSessionsInfoResponse extends createResponseDto(
  sessionInfoSchema.array(),
) {}
