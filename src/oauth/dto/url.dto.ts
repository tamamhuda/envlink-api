import { createResponseDto } from 'src/common/dto/response.dto';
import z from 'zod';

export const exchangeCodeSchema = z.object({
  url: z.string().url(),
});

export class GoogleUrlResponse extends createResponseDto(exchangeCodeSchema) {}
