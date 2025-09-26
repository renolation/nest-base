import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthenticationService, LoginResponse } from './authentication.service';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication controller for handling user authentication endpoints
 */
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Login endpoint for user authentication
   * @param loginDto - Login credentials containing email and password
   * @returns Promise<LoginResponse> - Authentication response
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authenticationService.login(loginDto);
  }

  /**
   * Admin test endpoint for smoke testing
   * @returns Object - Test response
   */
  @Post('admin/test')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Authentication controller is working',
      timestamp: new Date().toISOString(),
    };
  }
}
