import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import * as z from 'zod';

export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class TokensDto extends createZodDto(tokensSchema) {}

export class TokensResponse extends createResponseDto(tokensSchema) {}
