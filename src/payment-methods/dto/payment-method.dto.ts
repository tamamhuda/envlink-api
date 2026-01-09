import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import * as z from 'zod';

export const cardSchema = z.object({
  network: z.string().nullable(),
  issuer: z.string().nullable(),
  card_type: z.string().nullable(),
  masked_card_number: z.string().nullable(),
  expiry_month: z.string().nullable(),
  expiry_year: z.string().nullable(),
  card_holder_name: z.string().nullable(),
});

export const directDebitSchema = z.object({
  bank_account_number: z.string().nullable(),
  bank_account_hash: z.string().nullable(),
});

export const ewalletOtcQrSchema = z.object({
  account_name: z.string().nullable(),
  account_number: z.string().nullable(),
  payment_code: z.string().nullable(),
  qr_string: z.string().nullable(),
  expires_at: z.string().nullable(),
});

export const paymentMethodSchema = baseSchema.extend({
  user_id: z.string().uuid().nonempty(),
  external_id: z.string(),
  type: z.nativeEnum(PaymentMethodType),
  reusability: z.string().nullable(),
  country: z.string().nullable(),
  currency: z.string().nullable(),
  status: z.string().nullable(),
  channel_code: z.string().nullable(),
  provider: z.string().nullable(),
  failure_code: z.string().nullable(),
  custom_name: z.string().nullable(),
  card: cardSchema.nullable(),
  direct_debit: directDebitSchema.nullable(),
  ewallet: ewalletOtcQrSchema.nullable(),
  recurring_expiry: z.date().nullable(),
  recurring_frequency: z.number().min(1).nullable(),
  is_default: z.boolean(),
  rank: z.number().min(1),
  metadata: z.record(z.string(), z.any()).nullable(),
});

export const paymentMethodDtoSchema = zodToCamelCase(paymentMethodSchema);

export class PaymentMethodDto extends createZodDto(paymentMethodDtoSchema) {}

export class PaymentMethodSerializerDto extends createZodDto(
  paymentMethodSchema,
) {}

export class PaymentMethodResponse extends createResponseDto(
  paymentMethodSchema,
) {}

export class AllPaymentMethodsResponse extends createResponseDto(
  z.array(paymentMethodSchema),
) {}
