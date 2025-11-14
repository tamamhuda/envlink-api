import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { TransactionStatus } from 'src/common/enums/trasaction-status.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';

import * as z from 'zod';

export const transactionSchema = baseSchema.extend({
  user_id: z.string().uuid(),
  cycle_id: z.string().uuid(),
  payment_method_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  reference_id: z.string().nonempty(),
  product_name: z.string().nonempty(),
  amount: z.number().min(0),
  currency: z.string().nullable(),
  status: z.nativeEnum(TransactionStatus),
  payment_method_type: z.string().nonempty(),
  payment_type: z.nativeEnum(PaymentType),
  metadata: z.object({}).catchall(z.any()).nullable(),
  paid_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .nullable(),
  failed_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .nullable(),
  failure_code: z.string().nullable(),
  refunded_at: z
    .string()
    .datetime()
    .transform((value) => new Date(value))
    .nullable(),
  invoice_id: z.string().nullable(),
  invoice_url: z.string().nullable(),
  invoice_number: z.string().nullable(),
  invoice_pdf_path: z.string().nullable(),
});

export const transactionStatusSchema = z
  .array(z.nativeEnum(TransactionStatus).nullable())
  .optional();

export const transactionDtoSchema = zodToCamelCase(transactionSchema);

export class TransactionDto extends createZodDto(transactionDtoSchema) {}

export class TransactionSerializerDto extends createZodDto(transactionSchema) {}

export class TransactionsResponse extends createResponseDto(
  z.array(transactionSchema),
) {}

export class TransactionResponse extends createResponseDto(transactionSchema) {}
