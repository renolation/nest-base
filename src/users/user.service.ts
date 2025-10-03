import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const token = `mock_jwt_token_${Date.now()}`;
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 365);

    const user = this.userRepository.create({
      ...createUserDto,
      token,
      tokenExpiry,
    });

    return this.userRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
  }

  async refreshToken(id: string): Promise<User> {
    const user = await this.findUserById(id);
    const token = `mock_jwt_token_${Date.now()}`;
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 365);

    user.token = token;
    user.tokenExpiry = tokenExpiry;

    return this.userRepository.save(user);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User | null> {
    const user = await this.findUserById(userId);
    if (user && user.token === refreshToken) {
      return user;
    }
    return null;
  }
}
