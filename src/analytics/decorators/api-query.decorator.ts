// src/common/decorators/pagination.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { TimelineInterval } from '../dto/query.dto';

export function ApiFromToDateQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'from',
      type: Date,
      required: false,
      description: 'Start date',
      default: new Date(),
      example: new Date().toISOString(),
    }),
    ApiQuery({
      name: 'to',
      type: Date,
      required: false,
      description: 'End date',
      default: new Date(),
      example: new Date().toISOString(),
    }),
  );
}

export function ApiTimelineQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'from',
      type: Date,
      required: false,
      description: 'Start date',
      default: new Date(),
      example: new Date().toISOString(),
    }),
    ApiQuery({
      name: 'to',
      type: Date,
      required: false,
      description: 'End date',
      default: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      example: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
    ApiQuery({
      name: 'interval',
      enum: TimelineInterval,
      required: false,
      description: 'Time interval',
      default: 'day',
      example: 'day',
    }),
  );
}
