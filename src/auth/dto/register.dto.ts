import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const registerSchema = z
  .object({
    fullName: z.string().min(3).nonempty(),
    username: z.string().min(3).nonempty(),
    email: z.string().email().nonempty(),
    password: z.string().min(8).max(100).nonempty().trim(),
    confirmPassword: z.string().min(8).max(100).nonempty().trim(),
    phoneNumber: z.string().optional(),
    redirectUrl: z.string().url().optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  });

export class RegisterDto extends createZodDto(registerSchema) {}
