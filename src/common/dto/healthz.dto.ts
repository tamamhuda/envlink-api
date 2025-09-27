import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

const healtzSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  db: z.string(),
  redis: z.enum(['UP', 'DOWN']),
  cache: z.enum(['UP', 'DOWN']),
  uptime: z.string(),
  memory: z.object({
    rss: z.number(),
    heapUsed: z.number(),
    heapTotal: z.number(),
  }),
});

export type Healthz = z.infer<typeof healtzSchema>;
export class HealthzDto extends createZodDto(healtzSchema) {}
