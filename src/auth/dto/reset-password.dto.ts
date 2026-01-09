import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import z from 'zod';

const resetPasswordSchema = z
  .object({
    token: z.string().nonempty().trim(),
    password: z.string().min(8).max(100).nonempty().trim(),
    confirm_password: z.string().min(8).max(100).nonempty().trim(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
  });

const resetPasswordDto = zodToCamelCase(resetPasswordSchema);

export class ResetPasswordBodyDto extends createZodDto(resetPasswordDto) {}

export class ResetPasswordRequest extends createZodDto(resetPasswordSchema) {}
