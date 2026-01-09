import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import z from 'zod';

const forgotPasswordSchema = z.object({
  captcha_token: z.string().optional(),
  reset_url: z.string().url().nonempty().trim(),
  email: z.string().email().nonempty().trim(),
});

const forgotPasswordDto = zodToCamelCase(forgotPasswordSchema);

export class ForgotPasswordBodyDto extends createZodDto(forgotPasswordDto) {}

export class ForgotPasswordRequest extends createZodDto(forgotPasswordSchema) {}
