import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export type FilterQuery = {
  archived?: boolean;
  expired?: boolean;
  privated?: boolean;
  q?: string;
};

export class FilterQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  expired?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  privated?: boolean;

  @IsOptional()
  @IsString()
  q?: string;
}
