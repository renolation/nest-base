import {Injectable} from '@nestjs/common';
import {CreatePostDto} from './dto/create-post.dto';
import {UpdatePostDto} from './dto/update-post.dto';
import User from "../users/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import Post from './entities/post.entity';
import {PostNotFoundException} from "./exception/postNotFound.exception";

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(Post) private repo: Repository<Post>,
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


    getAllPosts() {
        return this.repo.find({relations: ['author']});
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

    update(id: number, updatePostDto: UpdatePostDto) {
        return `This action updates a #${id} post`;
    }

    remove(id: number) {
        return `This action removes a #${id} post`;
    }
}
