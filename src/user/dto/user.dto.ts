import { createZodDto } from 'nestjs-zod';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { baseSchema } from 'src/common/schemas/base.schema';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const userBaseSchema = baseSchema.extend({
  email: z.string().email().nonempty(),
  username: z.string().min(3).nonempty(),
  full_name: z.string().nonempty(),
  phone_number: z.string().nullable().optional(),
  role: z.nativeEnum(RolesEnum).default(RolesEnum.USER),
  avatar: z.string().url().nullable().optional(),
});

const updateSchema = zodToCamelCase(
  userBaseSchema
    .pick({
      username: true,
      full_name: true,
      email: true,
      phone_number: true,
      avatar: true,
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      path: ['body'],
      message: 'Provide at least one field to update',
    }),
);

export class UserDto extends createZodDto(userBaseSchema) {}

export class UpdateUserBodyDto extends createZodDto(updateSchema) {}
