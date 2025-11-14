import * as z from 'zod';

export const baseSchema = z.object({
  id: z.string().uuid().nonempty(),
  created_at: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  updated_at: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
});
