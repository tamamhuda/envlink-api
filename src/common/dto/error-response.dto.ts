import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { ErrorApiResponse } from '../../common/interfaces/api-response.intercace';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

function createErrorResponseSchema<T extends StatusCodes>(statusCode: T) {
  const reason = getReasonPhrase(statusCode);

  return z.object({
    success: z.boolean().default(false),
    status: z.number().default(statusCode),
    message: z.string().optional(),
    error: z
      .instanceof(Object)
      .or(z.string())
      .default(`${reason} Exception`)
      .optional(),
    path: z.string(),
    timestamp: z
      .string()
      .datetime()
      .transform((val) => new Date(val).toDateString()),
  });
}

export function createErrorResponseDto<T extends StatusCodes>(
  statusCode: T,
): new () => ErrorApiResponse {
  const responseSchema = createErrorResponseSchema(statusCode);
  return class ResponseDto extends createZodDto(responseSchema) {};
}

export class ErrorResponse extends createErrorResponseDto(
  StatusCodes.NOT_FOUND,
) {}
