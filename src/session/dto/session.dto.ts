import { createZodDto } from 'nestjs-zod';
import { userInfoSchema } from 'src/auth/dto/user-info.dto';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';

export const sessionInfoSchema = baseSchema.extend({
  userAgent: z.string().max(255).optional().nullable(),
  ipLocation: z.string().max(255).optional().nullable(),
  isRevoked: z.boolean().default(false),
  revokedAt: z.date().optional().nullable(),
  expiresAt: z.date().optional().nullable(),
  user: userInfoSchema,
});

export class SessionInfoDto extends createZodDto(sessionInfoSchema) {}

export class SessionInfoResponse extends createResponseDto(sessionInfoSchema) {}

export class SessionsInfoResponse extends createResponseDto(
  sessionInfoSchema.array(),
) {}
