import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationInput } from '../../base/dto';

export class CreateFoodDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  outOfStock: boolean;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  featuredImage: string;

  images: string;
}

export class UpdateFoodDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  outOfStock: boolean;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  price: number;

  featuredImage: string;

  images: string;
}

export class FoodFilter {
  @IsOptional()
  @IsBooleanString()
  outOfStock: string;

  @IsOptional()
  @IsNumberString()
  minPrice: string;

  @IsOptional()
  @IsNumberString()
  maxPrice: string;
}

export class FoodQuery {
  @ValidateNested()
  @Type(() => FoodFilter)
  @IsOptional()
  filter?: FoodFilter;

  @IsOptional()
  @IsString()
  search?: string;

  @ValidateNested()
  @Type(() => PaginationInput)
  pagination?: PaginationInput;
}
