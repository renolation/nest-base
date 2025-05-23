import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    ClassSerializerInterceptor, UseInterceptors
} from '@nestjs/common';
import {PostsService} from './posts.service';
import {CreatePostDto} from './dto/create-post.dto';
import {UpdatePostDto} from './dto/update-post.dto';
import JwtAuthenticationGuard from "../authentication/jwt-authentication.guard";
import RequestWithUser from "../authentication/requestWithUser.interface";
import {PaginationParams} from "../utils/types/paginationParams";
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {GET_POSTS_CACHE_KEY} from "./postsCacheKey.constant";

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
    constructor(private readonly postsService: PostsService) {
    }

    @Post()
    @UseGuards(JwtAuthenticationGuard)
    async createPost(@Body() post: CreatePostDto, @Req() req: RequestWithUser) {
        return this.postsService.createPost(post, req.user);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheKey(GET_POSTS_CACHE_KEY)
    @CacheTTL(120)
    @Get()
    async getPosts(
        @Query('search') search: string,
        @Query() { offset, limit }: PaginationParams
    ) {
        if (search) {
            return this.postsService.searchForPosts(search, offset, limit);
        }
        return this.postsService.getAllPosts(offset, limit);
    }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postsService.update(+id, updatePostDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.postsService.remove(+id);
    }
}
