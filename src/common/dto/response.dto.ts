import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { ApiResponse } from '../interfaces/api-response.intercace';
import { HttpStatus } from '@nestjs/common';

const okResponseSchema = z.object({
  message: z.string().default('OK'),
});

function createResponseSchema<T extends z.ZodSchema>(
  zodSchema: T,
  httpStatus: HttpStatus,
) {
  return z.object({
    success: z.boolean(),
    status: z.number().default(httpStatus),
    path: z.string(),
    data: zodSchema,
    timestamp: z.string().date().default(new Date().toISOString()),
  });
}

export function createResponseDto<T extends z.ZodSchema>(
  schema: T,
): new () => ApiResponse<z.infer<T>> {
  const responseSchema = createResponseSchema(schema, HttpStatus.OK);
  return class ResponseDto extends createZodDto(
    responseSchema as z.ZodType<ApiResponse<z.infer<T>>>,
  ) {};
}

export class OkDto extends createZodDto(okResponseSchema) {}

export class OkResponse extends createResponseDto(okResponseSchema) {}
