import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFoodDto, FoodQuery, UpdateFoodDto } from './food.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { RoleGuard } from '../../guards/role-guard';
import { Role } from '../../decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { ImageInterceptor } from '../../lib/image.interceptor';
import { FoodService } from './food.service';

@Controller('food')
@ApiTags('food')
@ApiBearerAuth()
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role({ roles: ['admin'] })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (_req, file, cb) =>
          file.mimetype.includes('image')
            ? cb(null, true)
            : cb(new BadRequestException('Only images are allowed'), false),
        storage: diskStorage({
          destination: './images/',
          filename: (_req, file, cb) =>
            cb(
              null,
              `${nanoid()}.${
                file.originalname.split('.')[
                  file.originalname.split('.').length - 1
                ]
              }`,
            ),
        }),
      },
    ),
    new ImageInterceptor(),
  )
  create(@Body() body: CreateFoodDto) {
    return this.foodService.createFood(body);
  }

  @Get()
  fetch(@Query() query: FoodQuery) {
    return this.foodService.fetchFoods(
      query.pagination,
      query.filter,
      query.search,
    );
  }

  @Get(':id')
  getFoodDetails(@Param('id', ParseIntPipe) id: number) {
    return this.foodService.getFoodDetails(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role({ roles: ['admin'] })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (_req, file, cb) =>
          file.mimetype.includes('image')
            ? cb(null, true)
            : cb(new BadRequestException('Only images are allowed'), false),
        storage: diskStorage({
          destination: './images/',
          filename: (_req, file, cb) =>
            cb(
              null,
              `${nanoid()}.${
                file.originalname.split('.')[
                  file.originalname.split('.').length - 1
                ]
              }`,
            ),
        }),
      },
    ),
    new ImageInterceptor(),
  )
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateFoodDto) {
    return this.foodService.updateFood(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role({ roles: ['admin'] })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.foodService.deleteFood(id);
  }
}
