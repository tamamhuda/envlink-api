import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import { createZodDto } from 'nestjs-zod';
import { userBaseSchema } from './user.dto';

const updateSchema = userBaseSchema
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
  });

export const updateUserDtoSchema = zodToCamelCase(updateSchema);

export class UpdateUserBodyDto extends createZodDto(updateUserDtoSchema) {}

export class UpdateUserRequest extends createZodDto(updateSchema) {}
