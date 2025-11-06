import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

const changePasswordSchema = zodToCamelCase(
  z
    .object({
      old_password: z.string().min(8).max(100).nonempty().trim(),
      new_password: z.string().min(8).max(100).nonempty().trim(),
      confirm_password: z.string().min(8).max(100).nonempty().trim(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: 'Passwords do not match',
    }),
);

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
