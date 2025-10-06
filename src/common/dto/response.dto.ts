import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';
import { ApiResponse } from '../interfaces/api-response.intercace';

function createResponseSchema<T extends z.ZodSchema>(zodSchema: T) {
  return z.object({
    success: z.boolean(),
    status: z.number(),
    path: z.string(),
    data: zodSchema,
    timestamp: z.string().date().default(new Date().toISOString()),
  });
}

export function createResponseDto<T extends z.ZodSchema>(
  schema: T,
): new () => ApiResponse<z.infer<T>> {
  const responseSchema = createResponseSchema(schema);
  return class ResponseDto extends createZodDto(
    responseSchema as z.ZodType<ApiResponse<z.infer<T>>>,
  ) {};
}
