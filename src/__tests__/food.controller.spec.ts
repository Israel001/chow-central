import { FoodService } from '../modules/food/food.service';
import { FoodController } from '../modules/food/food.controller';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateFoodDto,
  FoodQuery,
  UpdateFoodDto,
} from '../modules/food/food.dto';

describe('FoodController', () => {
  let foodController: FoodController;
  let foodService: FoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodController],
      providers: [
        FoodService,
        {
          provide: FoodService,
          useFactory: () => ({
            createFood: jest.fn(() => {}),
            updateFood: jest.fn(() => {}),
            getFoodDetails: jest.fn(() => {}),
            fetchFoods: jest.fn(() => {}),
            deleteFood: jest.fn(() => {}),
          }),
        },
      ],
    }).compile();

    foodController = module.get<FoodController>(FoodController);
    foodService = module.get<FoodService>(FoodService);
  });

  it('should call create method', async () => {
    const request = new CreateFoodDto();
    expect(foodController.create(request)).not.toEqual(null);
    expect(foodService.createFood).toHaveBeenCalledWith(request);
  });

  it('should call fetch method', async () => {
    const request = new FoodQuery();
    expect(foodController.fetch(request)).not.toEqual(null);
    expect(foodService.fetchFoods).toHaveBeenCalledWith(
      request.pagination,
      request.filter,
      request.search,
    );
  });

  it('should call getFoodDetails method', async () => {
    expect(foodController.getFoodDetails(1)).not.toEqual(null);
    expect(foodService.getFoodDetails).toHaveBeenCalledWith(1);
  });

  it('should call update method', async () => {
    const id = 1;
    const food = new UpdateFoodDto();
    expect(foodController.update(id, food)).not.toEqual(null);
    expect(foodService.updateFood).toHaveBeenCalledWith(id, food);
  });

  it('should call delete method', async () => {
    expect(foodController.delete(1)).not.toEqual(null);
    expect(foodService.deleteFood).toHaveBeenCalledWith(1);
  });
});
