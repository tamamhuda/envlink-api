import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

const loginSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().min(8).max(100).nonempty(),
  captcha_token: z.string().optional(),
});

const loginDto = zodToCamelCase(loginSchema);

export class LoginDto extends createZodDto(loginDto) {}

export class LoginRequest extends createZodDto(loginSchema) {}
