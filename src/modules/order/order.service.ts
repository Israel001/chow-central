import { PrismaService } from 'nestjs-prisma';
import { IAuthContext, OrderDir } from '../../types';
import { CreateOrderDto, OrderFilter } from './order.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationInput } from '../../base/dto';
import { buildResponseDataWithPagination } from '../../utils';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(order: CreateOrderDto, { username }: IAuthContext) {
    if (!order.items.length)
      throw new BadRequestException('Order should have at least one item');
    if (order.items.some((item) => !item.quantity))
      throw new BadRequestException(
        'Some of the items provided has an invalid quantity',
      );
    const itemIds = order.items.reduce<number[]>((prev, cur) => {
      prev.push(cur.id);
      return prev;
    }, []);
    const items = await this.prisma.food.findMany({
      where: {
        id: { in: itemIds },
      },
    });
    if (itemIds.filter((id) => !items.find((item) => item.id === id)).length) {
      throw new BadRequestException(
        'Some of the items provided does not exist',
      );
    }
    if (items.some((item) => item.outOfStock)) {
      throw new BadRequestException('Remove out of stock items from the order');
    }
    const totalPrice = items.reduce((prev, cur, idx) => {
      // USING THIS METHOD BECAUSE REDUCE() IS SYNCHRONOUS
      prev += parseFloat(cur.price.toString()) * order.items[idx].quantity;
      return prev;
    }, 0);
    return this.prisma.order.create({
      data: {
        totalPrice,
        user: {
          connect: { username },
        },
      },
    });
  }

  async fetchOrders(
    pagination: PaginationInput,
    filter: OrderFilter,
    { username }: IAuthContext,
  ) {
    const { page = 1, limit = 20 } = pagination;
    const conditions = {
      ...(filter?.status ? { status: filter?.status } : {}),
      ...(filter?.startDate ? { createdAt: { gte: filter?.startDate } } : {}),
      ...(filter?.endDate ? { createdAt: { lte: filter?.endDate } } : {}),
      ...(filter?.minAmount
        ? { totalPrice: { gte: parseFloat(filter?.minAmount) } }
        : {}),
      ...(filter?.maxAmount
        ? { totalPrice: { lte: parseFloat(filter?.maxAmount) } }
        : {}),
      user: { username },
    };
    const totalOrders = await this.prisma.order.count({
      where: conditions,
    });
    const orders = await this.prisma.order.findMany({
      where: conditions,
      orderBy: {
        [pagination.orderBy || 'createdAt']:
          pagination.orderDir || OrderDir.DESC,
      },
      skip: limit * (page - 1),
      take: limit,
    });
    return buildResponseDataWithPagination(orders, totalOrders, {
      page,
      limit,
    });
  }

  async getOrderById(id: number, { username }: IAuthContext) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
        user: {
          username,
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: number, auth: IAuthContext) {
    // In a normal situation, there should be a payment/transaction id provided
    // to validate the integrity of the payment for this particular order
    // but in this scenario, will assume that payment has been made
    const order = await this.getOrderById(id, auth);
    return this.prisma.order.update({
      where: { id: order.id },
      data: { paidStatus: 'PAID' },
    });
  }
}
