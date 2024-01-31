import { PrismaClient } from '@prisma/client';
import { Role } from '../src/types';
import bcrypt from 'bcryptjs';
require('dotenv').config();

const prisma = new PrismaClient();

const adminUsers = [
  {
    username: 'izzy001',
    email: 'izzy@test.com',
    password: process.env.ADMIN_PASSWORD,
    role: Role.ADMIN,
  },
];

const foods = [
  {
    name: 'Rice',
    description: 'African made Rice',
    outOfStock: false,
    price: 150,
  },
  {
    name: 'Beans',
    description: 'Protein-rich',
    outOfStock: false,
    price: 200,
  },
  {
    name: 'Palm oil',
    description: 'Local made',
    outOfStock: false,
    price: 70.99,
  },
  {
    name: 'Jollof rice',
    description: 'Ghanian made',
    outOfStock: false,
    price: 50,
  },
  {
    name: 'Sushi',
    description: 'Japanese made',
    outOfStock: false,
    price: 1000,
  },
];

export async function seeder() {
  try {
    console.log('Seeding....');
    await prisma.food.deleteMany();
    await prisma.order.deleteMany();
    const userPromises = [];
    const foodPromises = [];
    for (const user of adminUsers) {
      user.password = bcrypt.hashSync(user.password, 12);
      userPromises.push(
        prisma.user.upsert({
          where: { username: user.username },
          update: { ...user },
          create: { ...user },
        }),
      );
    }
    for (const food of foods) {
      foodPromises.push(
        prisma.food.create({
          data: { ...food },
        }),
      );
    }
    await Promise.all(userPromises);
    await Promise.all(foodPromises);
    console.log('Done Seeding');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
