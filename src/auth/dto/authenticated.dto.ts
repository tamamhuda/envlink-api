import * as z from 'zod';
import { userInfoSchema } from './user-info.dto';
import { tokensSchema } from './token.dto';
import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';

export const authenticatedSchema = z.object({
  tokens: tokensSchema,
  user: userInfoSchema,
});

export const authenticatedDtoSchema = zodToCamelCase(authenticatedSchema);

export class AuthenticatedDto extends createZodDto(authenticatedDtoSchema) {}

export class AuthenticatedSerializerDto extends createZodDto(
  authenticatedSchema,
) {}

export class AuthenticatedResponse extends createResponseDto(
  authenticatedSchema,
) {}
