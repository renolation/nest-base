import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const inputCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const expectedUser = {
        id: 'uuid',
        ...inputCreateUserDto,
        token: 'mock_jwt_token_1234567890',
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.createUser.mockResolvedValue(expectedUser);

      const actualUser = await controller.createUser(inputCreateUserDto);

      expect(mockUserService.createUser).toHaveBeenCalledWith(inputCreateUserDto);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const expectedUsers = [
        {
          id: 'uuid1',
          email: 'test1@example.com',
          name: 'Test User 1',
          token: 'mock_jwt_token_1234567890',
          tokenExpiry: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid2',
          email: 'test2@example.com',
          name: 'Test User 2',
          token: 'mock_jwt_token_1234567891',
          tokenExpiry: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserService.findAllUsers.mockResolvedValue(expectedUsers);

      const actualUsers = await controller.findAllUsers();

      expect(mockUserService.findAllUsers).toHaveBeenCalled();
      expect(actualUsers).toEqual(expectedUsers);
    });
  });

  describe('findUserById', () => {
    it('should return a user by id', async () => {
      const inputId = 'test-id';
      const expectedUser = {
        id: inputId,
        email: 'test@example.com',
        name: 'Test User',
        token: 'mock_jwt_token_1234567890',
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.findUserById.mockResolvedValue(expectedUser);

      const actualUser = await controller.findUserById(inputId);

      expect(mockUserService.findUserById).toHaveBeenCalledWith(inputId);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const inputId = 'test-id';
      const inputUpdateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const expectedUser = {
        id: inputId,
        email: 'test@example.com',
        name: 'Updated Name',
        token: 'mock_jwt_token_1234567890',
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.updateUser.mockResolvedValue(expectedUser);

      const actualUser = await controller.updateUser(inputId, inputUpdateUserDto);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(inputId, inputUpdateUserDto);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const inputId = 'test-id';

      mockUserService.deleteUser.mockResolvedValue(undefined);

      await controller.deleteUser(inputId);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(inputId);
    });
  });

  describe('refreshToken', () => {
    it('should refresh user token', async () => {
      const inputId = 'test-id';
      const expectedUser = {
        id: inputId,
        email: 'test@example.com',
        name: 'Test User',
        token: 'new_mock_jwt_token_1234567890',
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.refreshToken.mockResolvedValue(expectedUser);

      const actualUser = await controller.refreshToken(inputId);

      expect(mockUserService.refreshToken).toHaveBeenCalledWith(inputId);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('testEndpoint', () => {
    it('should return test message', async () => {
      const expectedMessage = { message: 'User module is working correctly' };

      const actualMessage = await controller.testEndpoint();

      expect(actualMessage).toEqual(expectedMessage);
    });
  });
});
