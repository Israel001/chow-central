import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../modules/order/order.controller';
import { CreateOrderDto, OrderQuery } from '../modules/order/order.dto';
import { OrderService } from '../modules/order/order.service';
import { MockUserSchema } from '../testHelpers/tests.helper';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        {
          provide: OrderService,
          useFactory: () => ({
            createOrder: jest.fn(() => {}),
            fetchOrders: jest.fn(() => {}),
            getOrderById: jest.fn(() => {}),
            updateOrderStatus: jest.fn(() => {}),
          }),
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should call create method', async () => {
    const request = new CreateOrderDto();
    const user = MockUserSchema;
    expect(orderController.create(request, { user })).not.toEqual(null);
    expect(orderService.createOrder).toHaveBeenCalledWith(request, user);
  });

  it('should call fetch method', async () => {
    const request = new OrderQuery();
    const user = MockUserSchema;
    expect(orderController.fetch(request, { user })).not.toEqual(null);
    expect(orderService.fetchOrders).toHaveBeenCalledWith(
      request.pagination,
      request.filter,
      user,
    );
  });

  it('should call getById method', async () => {
    const user = MockUserSchema;
    expect(orderController.getById(1, { user })).not.toEqual(null);
    expect(orderService.getOrderById).toHaveBeenCalledWith(1, user);
  });

  it('should call updateStatus method', async () => {
    const user = MockUserSchema;
    expect(orderController.updateStatus(1, { user })).not.toEqual(null);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, user);
  });
});
