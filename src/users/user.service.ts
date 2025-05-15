import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import User from './entities/user.entity';
import CreateUserDto from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import {FilesService} from "../files/files.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly filesService: FilesService
    ) {
    }

    async getByEmail(email: string) {
        const user = await this.usersRepository.findOne({where: {email}});
        if (user) {
            return user;
        }
        throw new HttpException(
            'User with this email does not exist',
            HttpStatus.NOT_FOUND,
        );
    }

    async getById(id: number) {
        const user = await this.usersRepository.findOne({where: {id}});
        if (user) {
            return user;
        }
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }

    async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
        const avatar = await this.filesService.uploadPublicFile(imageBuffer, filename);
        const user = await this.getById(userId);
        await this.usersRepository.update(userId, {
            ...user,
            avatar
        });
        return avatar;
    }

    async create(userData: CreateUserDto) {
        const newUser = this.usersRepository.create(userData);
        await this.usersRepository.save(newUser);
        return newUser;
    }

    async setCurrentRefreshToken(refreshToken: string, userId: number) {
        const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.update(userId, {
            currentHashedRefreshToken,
        });
    }

    async removeRefreshToken(userId: number) {
        return this.usersRepository.update(userId, {
            currentHashedRefreshToken: null,
        });
    }

}
