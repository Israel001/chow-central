import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';
import { LoginDTO } from '../modules/auth/auth.dto';
import { MockUserSchema } from '../testHelpers/tests.helper';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthController,
        {
          provide: AuthService,
          useFactory: () => ({
            login: jest.fn(() => {}),
          }),
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should call login method', async () => {
    const request = new LoginDTO();
    const user = MockUserSchema;
    expect(authController.login(request, { user })).not.toEqual(null);
    expect(authService.login).toHaveBeenCalledWith(user);
  });
});
