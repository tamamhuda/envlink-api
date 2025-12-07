import { createZodDto } from 'nestjs-zod';
import { zodToCamelCase } from 'src/common/utils/case-transform.util';
import * as z from 'zod';

export const sortPaymentMethodsSchema = z.object({
  items: z
    .array(
      z.object({
        payment_method_id: z.string().uuid().min(1),
        rank: z.number().min(1),
      }),
    )
    .superRefine((items, ctx) => {
      const ids = items.map((i) => i.payment_method_id);
      const ranks = items.map((i) => i.rank);

      const duplicateId = ids.length !== new Set(ids).size;
      const duplicateRank = ranks.length !== new Set(ranks).size;

      if (duplicateId || duplicateRank) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate payment_method_id or rank found in request body',
          path: [], // applies to items root
        });
      }
    }),
});

const sortPaymentMethodDtoSchema = zodToCamelCase(sortPaymentMethodsSchema);
export class SortPaymentMethodsBodyDto extends createZodDto(
  sortPaymentMethodDtoSchema,
) {}

export class SortPaymentMethodsRequest extends createZodDto(
  sortPaymentMethodsSchema,
) {}
