import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const exchangeCodeSchema = z.object({
  code: z.string(),
});

export class ExchangeCodeBodyDto extends createZodDto(exchangeCodeSchema) {}

export class ExchangeCodeRequest extends ExchangeCodeBodyDto {}
