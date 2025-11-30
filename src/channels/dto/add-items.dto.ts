import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

export const addItemsSchema = z.object({
  itemsIds: z.array(z.string().uuid()).min(1).max(100),
});

export const addItemsDto = zodToCamelCase(addItemsSchema);

export class AddItemsBodyDto extends createZodDto(addItemsDto) {}

export class AddItemsRequest extends createZodDto(addItemsSchema) {}
