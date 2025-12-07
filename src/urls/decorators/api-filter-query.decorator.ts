import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiUrlFilterQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'archived',
      type: Boolean,
      required: false,
      description: 'Filter by archived status',
      default: false,
      example: false,
    }),
    ApiQuery({
      name: 'expired',
      type: Boolean,
      required: false,
      description: 'Filter by expired status',
      default: false,
      example: false,
    }),
    ApiQuery({
      name: 'privated',
      type: Boolean,
      required: false,
      description: 'Filter by private status',
      default: false,
      example: false,
    }),
  );
}
