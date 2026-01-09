import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import z from 'zod';

const unlockUrlDtoSchema = zodToCamelCase(
  z.object({
    access_code: z.string().nonempty(),
  }),
);

export class UnlockUrlBodyDto extends createZodDto(unlockUrlDtoSchema) {}

export class UnlockUrlRequest extends UnlockUrlBodyDto {}
