import {Module} from '@nestjs/common';
import {CategoriesService} from './categories.service';
import {CategoriesController} from './categories.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import Post from "../posts/entities/post.entity";
import Category from "./entities/category.entity";

@Module({
    controllers: [CategoriesController],
    imports: [TypeOrmModule.forFeature([Category])],

    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {
}
