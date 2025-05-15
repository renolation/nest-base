import {Module} from '@nestjs/common';
import {PostsService} from './posts.service';
import {PostsController} from './posts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import User from "../users/entities/user.entity";
import Post from "./entities/post.entity";

@Module({
    controllers: [PostsController],
    imports: [TypeOrmModule.forFeature([Post])],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {
}
