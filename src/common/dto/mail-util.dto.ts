import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const templateVariableSchema = z.object({
  APP_NAME: z.string().nonempty(),
  FIRST_NAME: z.string().nonempty(),
  VERIFY_LINK: z.string().nonempty(),
  EXPIRY: z.string().nonempty(),
});

export class TemplateVariableDto extends createZodDto(templateVariableSchema) {}

export type TemplateVariableType = z.infer<typeof templateVariableSchema>;
