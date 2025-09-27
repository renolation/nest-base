import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user with token and tokenExpiry', async () => {
      const inputCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const expectedUser = {
        ...inputCreateUserDto,
        id: 'uuid',
        token: 'mock_jwt_token_1234567890',
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const actualUser = await service.createUser(inputCreateUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: inputCreateUserDto.email,
          name: inputCreateUserDto.name,
          avatarUrl: inputCreateUserDto.avatarUrl,
          token: expect.stringMatching(/^mock_jwt_token_\d+$/),
          tokenExpiry: expect.any(Date),
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('findUserById', () => {
    it('should return a user when found', async () => {
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

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const actualUser = await service.findUserById(inputId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: inputId } });
      expect(actualUser).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const inputId = 'non-existent-id';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserById(inputId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: inputId } });
    });
  });

  describe('refreshToken', () => {
    it('should refresh user token and tokenExpiry', async () => {
      const inputId = 'test-id';
      const mockUser = {
        id: inputId,
        email: 'test@example.com',
        name: 'Test User',
        token: 'old_token',
        tokenExpiry: new Date(),
        save: jest.fn(),
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const actualUser = await service.refreshToken(inputId);

      expect(mockUser.token).toMatch(/^mock_jwt_token_\d+$/);
      expect(mockUser.tokenExpiry).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(actualUser).toEqual(mockUser);
    });
  });
});
