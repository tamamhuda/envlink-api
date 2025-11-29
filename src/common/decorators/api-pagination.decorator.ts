// src/common/decorators/pagination.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      type: Number,
      required: false,
      description: 'Page number',
      default: 1,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
      description: 'Page size',
      default: 1,
      example: 10,
    }),
  );
}
