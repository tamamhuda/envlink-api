import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const sortPaymentMethodsDtoSchema = zodToCamelCase(
  z
    .array(
      z.object({
        payment_method_id: z.string().uuid().nonempty(),
        rank: z.number().min(1),
      }),
    )
    .refine(
      (items) => {
        const ids = items.map((i) => i.payment_method_id);
        const ranks = items.map((i) => i.rank);
        const uniqueIds = new Set(ids);
        const uniqueRanks = new Set(ranks);
        return (
          ids.length === uniqueIds.size && ranks.length === uniqueRanks.size
        );
      },
      {
        message: 'Duplicate payment_method_id or rank found in request body',
        path: [], // applies error to entire array
      },
    ),
);

export class SortPaymentMethodsBodyDto extends createZodDto(
  sortPaymentMethodsDtoSchema,
) {}

export class SortPaymentMethodsRequest extends SortPaymentMethodsBodyDto {}
