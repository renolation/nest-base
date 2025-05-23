import {HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, Connection} from 'typeorm';
import User from './entities/user.entity';
import CreateUserDto from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import {FilesService} from "../files/files.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly filesService: FilesService,
        private connection: Connection,
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

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.getById(userId);

        const isRefreshTokenMatching = await bcrypt.compare(
            refreshToken,
            user.currentHashedRefreshToken
        );

        if (isRefreshTokenMatching) {
            return user;
        }
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

    async deleteAvatar(userId: number) {
        const queryRunner = this.connection.createQueryRunner();

        const user = await this.getById(userId);
        const fileId = user.avatar?.id;
        if (fileId) {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                await queryRunner.manager.update(User, userId, {
                    ...user,
                    avatar: null
                });
                await this.filesService.deletePublicFileWithQueryRunner(fileId, queryRunner);
                await queryRunner.commitTransaction();
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw new InternalServerErrorException();
            } finally {
                await queryRunner.release();
            }

        }
    }

    async create(userData: CreateUserDto) {
        const newUser = this.usersRepository.create(userData);
        await this.usersRepository.save(newUser);
        return newUser;
    }
    //region token
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
    //endregion


}
