import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const sendMailVerifySchema = z.object({
  APP_NAME: z.string().nonempty(),
  FIRST_NAME: z.string().nonempty(),
  VERIFY_LINK: z.string().nonempty(),
  EXPIRY: z.string().nonempty(),
});

export class SendMailVerifyDto extends createZodDto(sendMailVerifySchema) {}

export type SendMailVerify = z.infer<typeof sendMailVerifySchema>;
