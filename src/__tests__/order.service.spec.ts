import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../modules/order/order.service';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrderDto, OrderFilter } from '../modules/order/order.dto';
import {
  MockFoodSchema,
  MockOrderSchema,
  MockPagination,
  MockUserSchema,
} from '../testHelpers/tests.helper';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationInput } from '../base/dto';

describe('OrderService', () => {
  let orderService: OrderService;
  let prisma: DeepMockProxy<{
    [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
  }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();
    orderService = module.get<OrderService>(OrderService);
    prisma = module.get(PrismaService);
  });

  describe('CreateOrder Method', () => {
    it('should return a successful response', async () => {
      prisma.order.create.mockResolvedValueOnce(MockOrderSchema);
      prisma.food.findMany.mockResolvedValueOnce([MockFoodSchema]);
      const createOrderSpy = jest.spyOn(orderService, 'createOrder');
      const order = new CreateOrderDto();
      order.items = [{ id: 1, quantity: 1 }];
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      const result = await orderService.createOrder(order, authContext);
      expect(createOrderSpy).toHaveBeenCalledWith(order, authContext);
      expect(result).toEqual(MockOrderSchema);
    });

    it('should throw bad request exception when order has no item', async () => {
      const order = new CreateOrderDto();
      order.items = [];
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(
        orderService.createOrder(order, authContext),
      ).rejects.toThrow(
        new BadRequestException('Order should have at least one item'),
      );
    });

    it('should throw bad request exception when order has item with 0 qty', async () => {
      const order = new CreateOrderDto();
      order.items = [{ id: 1, quantity: 0 }];
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(
        orderService.createOrder(order, authContext),
      ).rejects.toThrow(
        new BadRequestException(
          'Some of the items provided has an invalid quantity',
        ),
      );
    });

    it('should throw bad request exception when one of the order item does not exist', async () => {
      prisma.food.findMany.mockResolvedValueOnce([]);
      const order = new CreateOrderDto();
      order.items = [{ id: 1, quantity: 1 }];
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(
        orderService.createOrder(order, authContext),
      ).rejects.toThrow(
        new BadRequestException('Some of the items provided does not exist'),
      );
    });

    it('should throw bad request exception when order contains item with out of stock status', async () => {
      prisma.food.findMany.mockResolvedValueOnce([
        { ...MockFoodSchema, outOfStock: true },
      ]);
      const order = new CreateOrderDto();
      order.items = [{ id: 1, quantity: 1 }];
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(
        orderService.createOrder(order, authContext),
      ).rejects.toThrow(
        new BadRequestException('Remove out of stock items from the order'),
      );
    });
  });

  describe('FetchOrders Method', () => {
    it('should return a successful response', async () => {
      prisma.order.findMany.mockResolvedValueOnce([]);
      prisma.order.count.mockResolvedValueOnce(0);
      const fetchOrdersSpy = jest.spyOn(orderService, 'fetchOrders');
      const pagination = new PaginationInput();
      const filter = new OrderFilter();
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      const result = await orderService.fetchOrders(
        pagination,
        filter,
        authContext,
      );
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        pagination,
        filter,
        authContext,
      );
      expect(result).toEqual(MockPagination([]));
    });
  });

  describe('GetOrderById Method', () => {
    it('should return a successful response', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(MockOrderSchema);
      const getOrderByIdSpy = jest.spyOn(orderService, 'getOrderById');
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      const result = await orderService.getOrderById(1, authContext);
      expect(getOrderByIdSpy).toHaveBeenCalledWith(1, authContext);
      expect(result).toEqual(MockOrderSchema);
    });

    it('should throw not found exception when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(orderService.getOrderById(1, authContext)).rejects.toThrow(
        new NotFoundException('Order not found'),
      );
    });
  });

  describe('UpdateOrderStatus Method', () => {
    it('should return a successful response', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(MockOrderSchema);
      prisma.order.update.mockResolvedValueOnce(MockOrderSchema);
      const updateOrderStatusSpy = jest.spyOn(
        orderService,
        'updateOrderStatus',
      );
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      const result = await orderService.updateOrderStatus(1, authContext);
      expect(updateOrderStatusSpy).toHaveBeenCalledWith(1, authContext);
      expect(result).toEqual(MockOrderSchema);
    });

    it('should throw not found exception when order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValueOnce(null);
      const authContext = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(orderService.updateOrderStatus(1, authContext)).rejects.toThrow(
        new NotFoundException('Order not found'),
      );
    });
  });
});
