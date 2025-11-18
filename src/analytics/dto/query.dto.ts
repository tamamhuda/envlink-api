// analytics.dto.ts
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedQueryDto } from 'src/common/dto/paginated.dto';

export enum TimelineInterval {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
}

export class FromToDateQuery {
  @IsOptional()
  @IsISO8601()
  from?: Date;

  @IsOptional()
  @IsISO8601()
  to?: Date;
}

export class TimelineQueryDto extends FromToDateQuery {
  // daily | hourly | weekly
  @IsOptional()
  @IsString()
  @IsEnum(TimelineInterval)
  interval?: TimelineInterval;
}

export class UrlLogsQueryDto extends FromToDateQuery {}
