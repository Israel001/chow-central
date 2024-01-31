import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './users.dto';
import * as bcrypt from 'bcryptjs';
import { IAuthContext } from '../../types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(user: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: user.email,
          },
          {
            username: user.username,
          },
        ],
      },
    });
    if (existingUser) {
      if (existingUser.email === user.email) {
        throw new ConflictException(
          `User with email: ${user.email} already exist`,
        );
      }
      if (existingUser.username === user.username) {
        throw new ConflictException(
          `User with username: ${user.username} already exist`,
        );
      }
    }
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const createdUser = await this.prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
      },
    });
    delete createdUser.password;
    return createdUser;
  }

  async getUserDetails({ username }: IAuthContext) {
    const userInfo = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
    if (!userInfo) throw new NotFoundException('User not found');
    delete userInfo.password;
    return userInfo;
  }
}
