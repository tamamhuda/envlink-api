import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

export const billingAddressSchema = baseSchema.extend({
  user_id: z.string().uuid().nonempty(),
  custom_name: z.string().min(2).max(100).nullable().optional(),
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  address: z.string().min(5).max(255),
  address2: z.string().min(5).max(255).nullable().optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  zip: z.string().min(2).max(20),
  is_default: z.boolean().default(false),
});

export const billingAddressDtoSchema = zodToCamelCase(billingAddressSchema);

export class BillingAddressDto extends createZodDto(billingAddressDtoSchema) {}

export class BillingAddressSerializerDto extends createZodDto(
  billingAddressSchema,
) {}

export class BillingAddressResponse extends createResponseDto(
  billingAddressSchema,
) {}

export class AllBillingAddressResponse extends createResponseDto(
  billingAddressSchema.array(),
) {}
