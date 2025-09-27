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

      const actualResponse = await service.login(inputLoginDto);

      expect(actualResponse).toHaveProperty('message', 'Login successful');
      expect(actualResponse).toHaveProperty('user');
      expect(actualResponse.user).toHaveProperty('email', 'test@example.com');
      expect(actualResponse).toHaveProperty('token');
      expect(actualResponse.token).toMatch(/^auth_token_\d+_[a-z0-9]+$/);
    });

    it('should throw UnauthorizedException with empty email', async () => {
      const inputLoginDto: LoginDto = {
        email: '',
        password: 'password123',
      };

      await expect(service.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with empty password', async () => {
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: '',
      };

      await expect(service.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
