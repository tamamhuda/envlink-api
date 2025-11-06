import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const loginSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().min(8).max(100).nonempty(),
});

export class LoginBodyDto extends createZodDto(loginSchema) {}
