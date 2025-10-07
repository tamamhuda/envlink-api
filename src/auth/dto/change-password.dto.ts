import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(8).max(100).nonempty().trim(),
    newPassword: z.string().min(8).max(100).nonempty().trim(),
    confirmPassword: z.string().min(8).max(100).nonempty().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
  });

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
