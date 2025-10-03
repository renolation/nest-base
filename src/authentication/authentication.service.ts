import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../users/user.service';

/**
 * Response interface for successful login
 */
export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

/**
 * Authentication service for handling user authentication
 */
@Injectable()
export class AuthenticationService {
  constructor(private readonly userService: UserService) {}

  /**
   * Authenticates a user with email and password
   * @param loginDto - Login credentials containing email and password
   * @returns Promise<LoginResponse> - Authentication response
   * @throws UnauthorizedException - When credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    
    // Find user by email
    const user = await this.userService.findUserByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // Simple password validation (in production, use bcrypt)
    if (user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // Generate a simple token (in production, use JWT)
    const token = `auth_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update user with new token and expiry
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 365); // Token valid for 1 year

    await this.userService.updateUser(user.id, {
      token,
      tokenExpiry,
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }
}
