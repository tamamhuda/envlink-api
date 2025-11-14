import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const bodyschema = z
  .object({
    string: z.any(),
  })
  .catchall(z.any());

export class WebhookRequest extends createZodDto(bodyschema) {}
