import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationService],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const actualResponse = await service.login(inputLoginDto);

      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const inputLoginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      await expect(service.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
