import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateFoodDto, FoodFilter, UpdateFoodDto } from './food.dto';
import { PaginationInput } from '../../base/dto';
import { OrderDir } from '../../types';
import { buildResponseDataWithPagination } from '../../utils';
import fs from 'fs';
import path, { dirname } from 'path';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async createFood(food: CreateFoodDto) {
    const foodExists = await this.prisma.food.findUnique({
      where: { name: food.name },
    });
    if (foodExists)
      throw new BadRequestException('Food name cannot be duplicate');
    return this.prisma.food.create({ data: { ...food } });
  }

  async updateFood(id: number, food: UpdateFoodDto) {
    const foodExists = await this.prisma.food.findUnique({ where: { id } });
    if (!foodExists) throw new NotFoundException('Food does not exist');
    const duplicateExists = await this.prisma.food.findFirst({
      where: {
        NOT: { id },
        name: food.name,
      },
    });
    if (duplicateExists)
      throw new BadRequestException('Food name cannot be duplicate');
    // DELETING OLD IMAGES FOR AN UPDATED FOOD ITEM
    if (food.featuredImage && food.featuredImage !== foodExists.featuredImage) {
      fs.unlinkSync(
        path.join(
          dirname(__dirname),
          '..',
          '..',
          '..',
          'images',
          foodExists.featuredImage,
        ),
      );
    }
    if (food.images && food.images.split(',').length) {
      for (const oldImage of foodExists.images.split(',')) {
        fs.unlinkSync(
          path.join(dirname(__dirname), '..', '..', '..', 'images', oldImage),
        );
      }
    }
    return this.prisma.food.update({ where: { id }, data: { ...food } });
  }

  async getFoodDetails(id: number) {
    return this.prisma.food.findFirst({ where: { id } });
  }

  async fetchFoods(
    pagination: PaginationInput,
    filter: FoodFilter,
    search: string,
  ) {
    let { page = 1, limit = 20 } = pagination;
    const baseConditions = {
      ...(filter?.outOfStock
        ? { outOfStock: filter?.outOfStock === 'true' }
        : {}),
      ...(filter?.minPrice
        ? { discountPrice: { gte: parseFloat(filter?.minPrice) } }
        : {}),
      ...(filter?.maxPrice
        ? { discountPrice: { lte: parseFloat(filter?.maxPrice) } }
        : {}),
    };
    let allConditions = [
      {
        ...baseConditions,
        ...(search ? { name: { search } } : {}),
      },
      {
        ...baseConditions,
        ...(search ? { description: { search } } : {}),
      },
    ];
    if (
      !Object.keys(allConditions[0]).length &&
      !Object.keys(allConditions[1]).length
    ) {
      allConditions = [];
    }
    const totalFoodItems = await this.prisma.food.count({
      where: allConditions.length ? { OR: allConditions } : {},
    });
    const foodItems = await this.prisma.food.findMany({
      where: allConditions.length ? { OR: allConditions } : {},
      orderBy: {
        [pagination.orderBy || 'createdAt']:
          pagination.orderDir || OrderDir.DESC,
      },
      skip: limit * (page - 1),
      take: limit,
    });
    return buildResponseDataWithPagination(foodItems, totalFoodItems, {
      page,
      limit,
    });
  }

  async deleteFood(id: number) {
    return this.prisma.food.delete({ where: { id } });
  }
}
