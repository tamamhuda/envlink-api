import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const sendMailVerifySchema = z.object({
  email: z.string(),
  firstName: z.string(),
  verifyLink: z.string(),
});

export class SendMailVerifyDto extends createZodDto(sendMailVerifySchema) {}

export type SendMailVerifyType = z.infer<typeof sendMailVerifySchema>;
