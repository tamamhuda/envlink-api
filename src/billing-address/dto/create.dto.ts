import { billingAddressSchema } from './billing-address.dto';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { createZodDto } from 'nestjs-zod';

export const createBillingAddressSchema = billingAddressSchema.omit({
  id: true,
  created_at: true,
  user_id: true,
  updated_at: true,
});

export const createBillingAddressDtoSchema = zodToCamelCase(
  createBillingAddressSchema,
);

export class CreateBillingAddressBodyDto extends createZodDto(
  createBillingAddressDtoSchema,
) {}

export class CreateBillingAddressRequest extends createZodDto(
  createBillingAddressSchema,
) {}
