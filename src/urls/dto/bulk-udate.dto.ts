import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/helpers/case-transform.helper';
import z from 'zod';
import { urlSchema } from './url.dto';

export const bulkUpdateUrlsSchema = z.object({
  item_ids: z.array(z.string()).min(1, 'Item IDs cannot be empty'),
  data: urlSchema
    .pick({
      redirect_type: true,
      is_archived: true,
      is_private: true,
      expires_at: true,
    })
    .partial(),
});

export const bulkUpdateUrlsDto = zodToCamelCase(bulkUpdateUrlsSchema);

export class BulkUpdateUrlsBodyDto extends createZodDto(bulkUpdateUrlsDto) {}

export class BulkUpdateUrlsRequest extends createZodDto(bulkUpdateUrlsSchema) {}
