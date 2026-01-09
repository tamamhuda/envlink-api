import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

const registerSchema = z
  .object({
    full_name: z.string().min(3).nonempty(),
    username: z.string().min(3).nonempty(),
    email: z.string().email().nonempty(),
    password: z.string().min(8).max(100).nonempty().trim(),
    confirm_password: z
      .string({
        description: '*confirm password must match with the password field',
      })
      .min(8)
      .max(100)
      .nonempty()
      .trim(),
    phone_number: z.string().nullable().optional(),
    captcha_token: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
  });

const registerBodyDto = zodToCamelCase(registerSchema);

export class RegisterBodyDto extends createZodDto(registerBodyDto) {}

export class RegisterRequest extends createZodDto(registerSchema) {}
