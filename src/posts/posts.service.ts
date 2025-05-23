import {Injectable} from '@nestjs/common';
import {CreatePostDto} from './dto/create-post.dto';
import {UpdatePostDto} from './dto/update-post.dto';
import User from "../users/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {FindManyOptions, MoreThan, Repository} from "typeorm";
import Post from './entities/post.entity';
import {PostNotFoundException} from "./exception/postNotFound.exception";
import PostsSearchService from "./postsSearch.service";
import {In} from "typeorm";

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(Post) private repo: Repository<Post>,
        private postsSearchService: PostsSearchService
    ) {
    }

    async createPost(post: CreatePostDto, user: User) {
        const newPost = this.repo.create({
            ...post,
            author: user
        });
        await this.repo.save(newPost);
        return newPost;
    }

    async searchForPosts(text: string, offset?: number, limit?: number) {
        const results = await this.postsSearchService.search(text);
        const ids = results.flatMap(result => result.hits.hits.map(hit => hit._source.id));
        if (!ids.length) {
            return [];
        }
        return this.repo
            .find({
                where: {id: In(ids)}
            });
    }



    async getAllPosts(offset?: number, limit?: number, startId = 0) {

        const where: FindManyOptions<Post>['where'] = {};
        let separateCount = 0;
        if (startId) {
            where.id = MoreThan(startId);
            separateCount = await this.repo.count();
        }


        const [items, count] = await this.repo.findAndCount({
            where,
            relations: {
                author: true
            },
            order: {
                id: 'ASC'
            },
            skip: offset,
            take: limit
        });

        return {
            items,
            count: startId ? separateCount : count
        }
    }

    async getPostById(id: number) {
        const post = await this.repo.findOne(
            {
                where: {id},
                relations: {author: true}
            }
        );
        if (post) {
            return post;
        }
        throw new PostNotFoundException(id);
    }

    async updatePost(id: number, post: UpdatePostDto) {
        await this.repo.update(id, post);
        const updatedPost = await this.repo.findOne({

            where: {id},
            relations: {author: true}

        });
        if (updatedPost) {
            return updatedPost
        }
        throw new PostNotFoundException(id);
    }

    findAll() {
        return `This action returns all posts`;
    }

    findOne(id: number) {
        return `This action returns a #${id} post`;
    }

    async update(id: number, post: UpdatePostDto) {
        await this.repo.update(id, post);
        const updatedPost = await this.repo.findOne({
            where: {id},
            relations: {
                author: true,
            }
        });
        if (updatedPost) {
            await this.postsSearchService.update(updatedPost);
            return updatedPost;
        }
        throw new PostNotFoundException(id);
    }

    async remove(id: number) {
        const deleteResponse = await this.repo.delete(id);
        if (!deleteResponse.affected) {
            throw new PostNotFoundException(id);
        }
        await this.postsSearchService.remove(id);
    }
}
