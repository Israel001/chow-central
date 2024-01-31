import { Prisma } from '@prisma/client';
import { OrderStatus, Role } from '../types';

export const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
export const hashedPassword =
  '$2a$12$FV/XQGWDvjCXuHCMc7YdLeBGtbOna4qMw87lw95DX0lGJgFimvJLG';

export const MockUserSchema = {
  username: 'izzy001',
  email: 'izzy@test.com',
  password: 'password',
  role: Role.ADMIN,
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MockOrderSchema = {
  id: 1,
  totalPrice: new Prisma.Decimal(0),
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 1,
  paidStatus: OrderStatus.UNPAID,
};

export const MockFoodSchema = {
  id: 1,
  name: 'Jollof Rice',
  description: 'Ghanian made',
  featuredImage: null,
  images: null,
  outOfStock: false,
  price: new Prisma.Decimal(10),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MockJwtService = {
  sign: jest.fn(() => accessToken),
};

export const MockPagination = (data: any) => {
  return {
    data,
    pagination: { limit: 20, page: 1, total: 0, size: 0, pages: 0 },
  };
};