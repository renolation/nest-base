import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import {UsersService} from "./user.service";
import {UsersController} from "./user.controller";
import {FilesModule} from "../files/file.module";
import Address from "./entities/address.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address]),
    ConfigModule,
      FilesModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}