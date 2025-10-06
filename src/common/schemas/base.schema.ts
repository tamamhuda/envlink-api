import * as z from 'zod';

export const baseSchema = z.object({
  id: z.string().uuid().nonempty(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
