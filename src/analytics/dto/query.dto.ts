// analytics.dto.ts
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum TimelineInterval {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
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

export class TimelineQuery extends TimelineQueryDto {}

export class UrlLogsQueryDto extends FromToDateQuery {}
