import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsNumberString, IsOptional, ValidateNested } from 'class-validator';
import { PaginationInput } from '../../base/dto';
import { IsValidDate } from '../../tools/date-validator';
import { OrderStatus } from '../../types';

export class OrderItem {
  @IsNumber()
  id: number;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => OrderItem)
  @IsArray()
  items: OrderItem[];
}

export class OrderFilter {
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsNumberString()
  minAmount: string;

  @IsOptional()
  @IsNumberString()
  maxAmount: string;

  @IsOptional()
  @IsValidDate()
  startDate?: Date;

  @IsOptional()
  @IsValidDate()
  endDate?: Date;
}

export class OrderQuery {
  @ValidateNested()
  @Type(() => OrderFilter)
  @IsOptional()
  filter?: OrderFilter;

  @ValidateNested()
  @Type(() => PaginationInput)
  pagination?: PaginationInput;
}
