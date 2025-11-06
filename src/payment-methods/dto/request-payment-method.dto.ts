import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import * as z from 'zod';

export const requestPaymentMethodSchema = z.object({
  action: z.string(),
  url: z.string().url().nonempty(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
});

export const requestPaymentMethodParamsSchema = z.object({
  success_return_url: z.string().url().nonempty(),
  failure_return_url: z.string().url().nonempty(),
});

export class PaymentMethodActionDto extends createZodDto(
  requestPaymentMethodSchema,
) {}

export class PaymentMethodActionResponse extends createResponseDto(
  requestPaymentMethodSchema,
) {}

export class ListPaymentMethodActionResponse extends createResponseDto(
  z.array(requestPaymentMethodSchema),
) {}
