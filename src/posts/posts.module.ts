import {Module} from '@nestjs/common';
import {PostsService} from './posts.service';
import {PostsController} from './posts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import User from "../users/entities/user.entity";
import Post from "./entities/post.entity";
import PostsSearchService from "./postsSearch.service";
import {SearchModule} from "../search/search.module";

@Module({
    controllers: [PostsController],
    imports: [TypeOrmModule.forFeature([Post]), SearchModule],
    providers: [PostsService, PostsSearchService],
    exports: [PostsService, PostsSearchService],
})
export class PostsModule {
}
