import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import z from 'zod';

export const bulkDeleteUrlsSchema = z.object({
  item_ids: z.array(z.string()).min(1, 'Item IDs cannot be empty'),
});

export const bulkDeleteUrlsDto = zodToCamelCase(bulkDeleteUrlsSchema);

export class BulkDeleteUrlsBodyDto extends createZodDto(bulkDeleteUrlsDto) {}

export class BulkDeleteUrlsRequest extends createZodDto(bulkDeleteUrlsSchema) {}
