import * as z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';

const requiredEwalletSchema = z.object({
  channel_code: z.enum(['DANA', 'SHOPEEPAY']),
});

const requiredDirectDebitSchema = z.object({
  channel_code: z.enum(['MANDIRI', 'BPI']),
});

export const createPaymentMethodDtoSchema = zodToCamelCase(
  z
    .object({
      type: z.enum(['EWALLET', 'DIRECT_DEBIT']),
      ewallet: requiredEwalletSchema.nullable().optional(),
      direct_debit: requiredDirectDebitSchema.nullable().optional(),
      default: z.boolean().optional().default(false),
      success_return_url: z.string().url(),
      failure_return_url: z.string().url(),
    })
    .refine(
      (data) => {
        if (data.type === 'EWALLET' && !data.ewallet) return false;
        return true;
      },
      {
        message: 'E-Wallet is required',
        path: ['ewallet'],
      },
    )
    .refine(
      (data) => {
        if (data.type === 'DIRECT_DEBIT' && !data.direct_debit) return false;
        return true;
      },
      {
        message: 'Direct Debit is required',
        path: ['directDebit'],
      },
    ),
);

export class CreatePaymentMethodDto extends createZodDto(
  createPaymentMethodDtoSchema,
) {}
