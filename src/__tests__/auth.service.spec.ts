import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../modules/auth/auth.service';
import {
  MockJwtService,
  MockUserSchema,
  accessToken,
  hashedPassword,
} from '../testHelpers/tests.helper';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: DeepMockProxy<{
    [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
  }>;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: MockJwtService },
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  describe('ValidateUser Method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully return user details', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({
        ...MockUserSchema,
        password: hashedPassword,
      });
      const validateUserSpy = jest.spyOn(authService, 'validateUser');
      const result = await authService.validateUser(
        MockUserSchema.username,
        MockUserSchema.password,
      );
      expect(validateUserSpy).toHaveBeenCalledWith(
        MockUserSchema.username,
        MockUserSchema.password,
      );
      expect(result).toEqual({ ...MockUserSchema, password: hashedPassword });
    });

    it('should throw unauthorized exception when password is incorrect', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({
        ...MockUserSchema,
        password: hashedPassword,
      });
      await expect(
        authService.validateUser(MockUserSchema.username, 'wrong password'),
      ).rejects.toThrow(new UnauthorizedException('Invalid details'));
    });

    it('should throw not found exception when user not found', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(null);
      await expect(
        authService.validateUser(
          MockUserSchema.username,
          MockUserSchema.password,
        ),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  describe('Login Method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a successful response', async () => {
      const loginSpy = jest.spyOn(authService, 'login');
      const result = await authService.login(MockUserSchema);
      expect(loginSpy).toHaveBeenCalledWith(MockUserSchema);
      expect(result).toEqual({
        accessToken,
        user: MockUserSchema,
      });
    });
  });
});
