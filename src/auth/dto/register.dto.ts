import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

const registerRequestSchema = zodToCamelCase(
  z
    .object({
      full_name: z.string().min(3).nonempty(),
      username: z.string().min(3).nonempty(),
      email: z.string().email().nonempty(),
      password: z.string().min(8).max(100).nonempty().trim(),
      confirm_password: z.string().min(8).max(100).nonempty().trim(),
      phone_number: z.string().nullable().optional(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Passwords do not match',
    }),
);

export class RegisterBodyDto extends createZodDto(registerRequestSchema) {}
