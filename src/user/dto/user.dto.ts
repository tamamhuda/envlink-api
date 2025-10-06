import { createZodDto } from 'nestjs-zod';
import { createResponseDto } from 'src/common/dto/response.dto';
import { RolesEnum } from 'src/common/enums/roles.enum';
import * as z from 'zod';

const userSchema = z.object({
  email: z.string().email().nonempty(),
  username: z.string().min(3).nonempty(),
  fullName: z.string().nonempty(),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(RolesEnum).default(RolesEnum.USER).optional(),
  avatar: z.string().url().optional(),
});

const updateSchema = userSchema
  .omit({
    role: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export class UserDto extends createZodDto(userSchema) {}

export class UpdateUserDto extends createZodDto(updateSchema) {}
