import { createZodDto } from 'nestjs-zod';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const userBaseSchema = baseSchema.extend({
  customer_id: z.string().nullable(),
  email: z.string().email().nonempty(),
  username: z.string().min(3).nonempty(),
  full_name: z.string().nonempty(),
  phone_number: z.string().nullable().optional(),
  role: z.nativeEnum(RolesEnum).default(RolesEnum.USER),
  avatar: z.string().nullable().optional(),
});

export class UserDto extends createZodDto(userBaseSchema) {}
