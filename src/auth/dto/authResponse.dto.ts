import * as z from 'zod';
import { userInfoSchema } from './user-info.dto';
import { tokensSchema } from './token.dto';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';

export const authenticatedSchema = z.object({
  tokens: tokensSchema,
  user: userInfoSchema,
});

export class AuthenticatedDto extends createZodDto(authenticatedSchema) {}

export class AuthenticatedResponse extends createResponseDto(
  authenticatedSchema,
) {}
