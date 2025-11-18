import { ParseIntPipe } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export function createPaginatedSchema<T extends z.ZodSchema>(zodSchema: T) {
  return z.object({
    data: zodSchema.array(),
    meta: z.object({
      total_items: z.number(),
      item_count: z.number(),
      items_per_page: z.number(),
      total_pages: z.number(),
      current_page: z.number(),
    }),
    links: z.object({
      first: z.string().url().nullable(),
      prev: z.string().url().nullable(),
      next: z.string().url().nullable(),
      last: z.string().url().nullable(),
    }),
  });
}
export class PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 1;
}
// export class PaginatedQueryDto extends createZodDto(paginatedQuerySchema) {}

// export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;
