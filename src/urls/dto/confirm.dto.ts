import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

const confirmUrlDtoSchema = zodToCamelCase(
  z.object({
    token: z.string().nonempty(),
  }),
);

export class ConfirmUrlBodyDto extends createZodDto(confirmUrlDtoSchema) {}

export class ConfirmUrlRequest extends ConfirmUrlBodyDto {}
