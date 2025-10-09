import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { ErrorResponse } from '../interfaces/api-response.intercace';
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
    timestamp: z.string().date().default(new Date().toISOString()),
  });
}

export function createErrorResponseDto<T extends StatusCodes>(
  statusCode: T,
): new () => ErrorResponse {
  const responseSchema = createErrorResponseSchema(statusCode);
  return class ResponseDto extends createZodDto(responseSchema) {};
}

export class ForbiddenResponse extends createErrorResponseDto(
  StatusCodes.FORBIDDEN,
) {}

export class NotFoundResponse extends createErrorResponseDto(
  StatusCodes.NOT_FOUND,
) {}

export class UnauthorizedResponse extends createErrorResponseDto(
  StatusCodes.UNAUTHORIZED,
) {}

export class BadRequestResponse extends createErrorResponseDto(
  StatusCodes.BAD_REQUEST,
) {}

export class ConflictResponse extends createErrorResponseDto(
  StatusCodes.CONFLICT,
) {}
