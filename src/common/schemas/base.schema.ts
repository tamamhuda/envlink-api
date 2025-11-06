import * as z from 'zod';

export const baseSchema = z.object({
  id: z.string().uuid().nonempty(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});
