import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import * as z from 'zod';

export const tokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

const tokensDtoSchema = zodToCamelCase(tokensSchema);

export class TokensDto extends createZodDto(tokensDtoSchema) {}
export class TokensSerializerDto extends createZodDto(tokensSchema) {}

export class TokensResponse extends createResponseDto(tokensSchema) {}
