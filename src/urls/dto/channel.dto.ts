import { baseSchema } from 'src/common/schemas/base.schema';
import * as z from 'zod';
import { urlSchema } from './url.dto';

export const channelSchema = baseSchema.extend({
  name: z.string().nonempty(),
  description: z.string().nullable().optional(),
  urls: z.array(urlSchema),
});
