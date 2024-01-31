import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { CreateOrderDto, OrderQuery } from './order.dto';
import { OrderService } from './order.service';

@Controller('order')
@ApiTags('order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() body: CreateOrderDto, @Req() request: any) {
    return this.orderService.createOrder(body, request.user as any);
  }

  @Get()
  fetch(@Query() query: OrderQuery, @Req() request: any) {
    return this.orderService.fetchOrders(
      query.pagination,
      query.filter,
      request.user as any,
    );
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    return this.orderService.getOrderById(id, request.user as any);
  }

  @Put(':id')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    return this.orderService.updateOrderStatus(id, request.user as any);
  }
}
