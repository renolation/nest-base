import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [AuthenticationService],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return successful login response with valid credentials', async () => {
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        message: 'Login successful',
        user: {
          email: 'test@example.com',
        },
        token: 'placeholder-token',
      };

      const actualResponse = await controller.login(inputLoginDto);

      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const inputLoginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      await expect(controller.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('test', () => {
    it('should return test response', async () => {
      const actualResponse = await controller.test();

      expect(actualResponse).toHaveProperty('message');
      expect(actualResponse).toHaveProperty('timestamp');
      expect(actualResponse.message).toBe('Authentication controller is working');
    });
  });
});
