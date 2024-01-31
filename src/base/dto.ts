import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OrderDir } from '../types';
import { Type as NestJSType } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationInput {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  orderBy?: string = '';

  @IsOptional()
  @IsEnum(OrderDir)
  orderDir?: OrderDir;
}

export class BasePaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Response data array',
    nullable: true,
    default: [],
  })
  pagination?: {
    total: number;
    limit: number;
    page: number;
    size: number;
    pages: number;
    offset?: number;
  };

  @ApiProperty({
    description: 'Response data array',
    nullable: true,
    default: [],
  })
  data: T[];

  static clone(this, dataType: NestJSType<any>) {
    this.data = [dataType];
    return this;
  }
}
