import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UsersService } from '../modules/users/users.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from '../modules/users/users.dto';
import { MockUserSchema, hashedPassword } from '../testHelpers/tests.helper';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: DeepMockProxy<{
    [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
  }>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('CreateUser Method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a successful response', async () => {
      prisma.user.create.mockResolvedValueOnce({
        ...MockUserSchema,
        password: hashedPassword,
      });
      const createUserSpy = jest.spyOn(usersService, 'createUser');
      const user = new CreateUserDto();
      user.password = 'password';
      const result = await usersService.createUser(user);
      expect(createUserSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual({ ...MockUserSchema, password: undefined });
    });

    it('should throw conflict exception when username is already taken', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(MockUserSchema);
      const user = new CreateUserDto();
      user.username = MockUserSchema.username;
      await expect(usersService.createUser(user)).rejects.toThrow(
        new ConflictException(
          `User with username: ${user.username} already exist`,
        ),
      );
    });

    it('should throw conflict exception when email is already taken', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(MockUserSchema);
      const user = new CreateUserDto();
      user.email = MockUserSchema.email;
      await expect(usersService.createUser(user)).rejects.toThrow(
        new ConflictException(`User with email: ${user.email} already exist`),
      );
    });
  });

  describe('GetUserDetails Method', () => {
    it('should return a successful response', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(MockUserSchema);
      const getUserDetailsSpy = jest.spyOn(usersService, 'getUserDetails');
      const param = { ...MockUserSchema, userId: 1, password: undefined };
      const result = await usersService.getUserDetails(param);
      expect(getUserDetailsSpy).toHaveBeenCalledWith({
        ...MockUserSchema,
        userId: 1,
      });
      expect(result).toEqual({ ...MockUserSchema, password: undefined });
    });

    it('should throw not found exception when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      const param = { ...MockUserSchema, userId: 1, password: undefined };
      await expect(usersService.getUserDetails(param)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });
});
