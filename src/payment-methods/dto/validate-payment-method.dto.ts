import * as z from 'zod';
import { cardSchema } from './payment-method.dto';
import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';

const requiredCardSchema = cardSchema
  .omit({
    issuer: true,
    network: true,
    card_holder_name: true,
  })
  .required({
    card_type: true,
    expiry_month: true,
    expiry_year: true,
    masked_card_number: true,
  });

const requiredEwalletSchema = z.object({
  channel_code: z.enum(['DANA', 'SHOPEEPAY']),
});

const requiredDirectDebitSchema = z.object({
  channel_code: z.enum(['MANDIRI', 'BPI']),
});

export const validatePaymentMethodDtoSchema = zodToCamelCase(
  z
    .object({
      type: z.enum(['CARD', 'EWALLET', 'DIRECT_DEBIT']),
      card: requiredCardSchema.nullable().optional(),
      ewallet: requiredEwalletSchema.nullable().optional(),
      direct_debit: requiredDirectDebitSchema.nullable().optional(),
    })
    .refine(
      (data) => {
        if (data.type === 'CARD' && !data.card) return false;
        return true;
      },
      {
        message: 'Card is required',
        path: ['card'],
      },
    )
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

export class ValidatePaymentMethodBodyDto extends createZodDto(
  validatePaymentMethodDtoSchema,
) {}

export class ValidatePaymentMethodRequest extends ValidatePaymentMethodBodyDto {}
