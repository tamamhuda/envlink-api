import { createZodDto } from 'nestjs-zod';
import * as z from 'zod';

export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),

  size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB.'),
  // buffer: z
  //   .instanceof(Buffer)
  //   .refine((buffer) => buffer.length > 0, 'File content is empty.'),
});

export class ImageUploadDto extends createZodDto(fileSchema) {}
