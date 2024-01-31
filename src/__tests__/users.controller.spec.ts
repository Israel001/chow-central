import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../modules/users/users.controller';
import { CreateUserDto } from '../modules/users/users.dto';
import { UsersService } from '../modules/users/users.service';
import { MockUserSchema } from '../testHelpers/tests.helper';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersService,
          useFactory: () => ({
            createUser: jest.fn(() => {}),
            getUserDetails: jest.fn(() => {}),
          }),
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should call signup method', async () => {
    const request = new CreateUserDto();
    expect(usersController.signup(request)).not.toEqual(null);
    expect(usersService.createUser).toHaveBeenCalledWith(request);
  });

  it('should call getUserDetails method', async () => {
    const user = MockUserSchema;
    expect(usersController.getUserDetails({ user })).not.toEqual(null);
    expect(usersService.getUserDetails).toHaveBeenCalledWith(user);
  });
});
