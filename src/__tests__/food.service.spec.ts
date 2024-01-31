import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateFoodDto,
  FoodFilter,
  UpdateFoodDto,
} from '../modules/food/food.dto';
import { FoodService } from '../modules/food/food.service';
import {
  MockFoodSchema,
  MockPagination,
} from '../testHelpers/tests.helper';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationInput } from '../base/dto';

describe('FoodService', () => {
  let foodService: FoodService;
  let prisma: DeepMockProxy<{
    [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
  }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();
    foodService = module.get<FoodService>(FoodService);
    prisma = module.get(PrismaService);
  });

  describe('CreateFood Method', () => {
    it('should return a successful response', async () => {
      prisma.food.create.mockResolvedValueOnce(MockFoodSchema);
      const createFoodSpy = jest.spyOn(foodService, 'createFood');
      const food = new CreateFoodDto();
      const result = await foodService.createFood(food);
      expect(createFoodSpy).toHaveBeenCalledWith(food);
      expect(result).toEqual(MockFoodSchema);
    });

    it('should throw conflict exception when food name already exists', async () => {
      prisma.food.findUnique.mockResolvedValueOnce(MockFoodSchema);
      const food = new CreateFoodDto();
      await expect(foodService.createFood(food)).rejects.toThrow(
        new BadRequestException('Food name cannot be duplicate'),
      );
    });
  });

  describe('UpdateFood Method', () => {
    it('should return a successful response', async () => {
      prisma.food.update.mockResolvedValueOnce(MockFoodSchema);
      prisma.food.findUnique.mockResolvedValueOnce(MockFoodSchema);
      const updateFoodSpy = jest.spyOn(foodService, 'updateFood');
      const food = new UpdateFoodDto();
      const result = await foodService.updateFood(1, food);
      expect(updateFoodSpy).toHaveBeenCalledWith(1, food);
      expect(result).toEqual(MockFoodSchema);
    });

    it('should throw not found exception when food does not exist', async () => {
      prisma.food.findUnique.mockResolvedValueOnce(null);
      const food = new UpdateFoodDto();
      await expect(foodService.updateFood(1, food)).rejects.toThrow(
        new NotFoundException('Food does not exist'),
      );
    });

    it('should throw bad request exception when food name is duplicate', async () => {
      prisma.food.findFirst.mockResolvedValueOnce(MockFoodSchema);
      prisma.food.findUnique.mockResolvedValueOnce(MockFoodSchema);
      const food = new UpdateFoodDto();
      await expect(foodService.updateFood(1, food)).rejects.toThrow(
        new BadRequestException('Food name cannot be duplicate'),
      );
    });
  });

  describe('FoodDetails Method', () => {
    it('should return a successful response', async () => {
      prisma.food.findFirst.mockResolvedValueOnce(MockFoodSchema);
      const getFoodDetailsSpy = jest.spyOn(foodService, 'getFoodDetails');
      const result = await foodService.getFoodDetails(1);
      expect(getFoodDetailsSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(MockFoodSchema);
    });
  });

  describe('FetchFoods Method', () => {
    it('should return a successful response', async () => {
      prisma.food.findMany.mockResolvedValueOnce([]);
      prisma.food.count.mockResolvedValueOnce(0);
      const fetchFoodsSpy = jest.spyOn(foodService, 'fetchFoods');
      const pagination = new PaginationInput();
      const filter = new FoodFilter();
      const result = await foodService.fetchFoods(pagination, filter, '');
      expect(fetchFoodsSpy).toHaveBeenCalledWith(pagination, filter, '');
      expect(result).toEqual(MockPagination([]));
    });
  });

  describe('DeleteFood Method', () => {
    it('should return a successful response', async () => {
      prisma.food.delete.mockResolvedValueOnce(MockFoodSchema)
      const deleteFoodSpy = jest.spyOn(foodService, 'deleteFood');
      const result = await foodService.deleteFood(1);
      expect(deleteFoodSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(MockFoodSchema);
    });
  });
});
