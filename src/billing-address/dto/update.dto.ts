import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import { createBillingAddressSchema } from './create.dto';
import { createZodDto } from 'nestjs-zod';

export const updateBillingAddressSchema = createBillingAddressSchema.partial();

export const updateBillingAddressDtoSchema = zodToCamelCase(
  updateBillingAddressSchema,
);

export class UpdateBillingAddressBodyDto extends createZodDto(
  updateBillingAddressDtoSchema,
) {}

export class UpdateBillingAddressRequest extends createZodDto(
  updateBillingAddressSchema,
) {}
