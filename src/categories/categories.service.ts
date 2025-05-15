import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {InjectRepository} from "@nestjs/typeorm";
import Post from "../posts/entities/post.entity";
import {Repository} from "typeorm";
import Category from "./entities/category.entity";
import {CategoryNotFoundException} from "./exception/categoryNotFound.exception";

@Injectable()
export class CategoriesService {
  
  constructor(
        @InjectRepository(Category) private repo: Repository<Category>,
    ) {
    }
  
  
  
  getAllCategories() {
  return this.repo.find({ relations: ['posts'] });
}
 
async getCategoryById(id: number) {
  const category = await this.repo.findOne({
    where: { id },
    relations: {
      posts: true,
    }
  });
  if (category) {
    return category;
  }
  throw new CategoryNotFoundException(id);
}
 
async updateCategory(id: number, category: UpdateCategoryDto) {
  await this.repo.update(id, category);
  const updatedCategory = await this.repo.findOne({
    where: { id },
    relations: {
      posts: true,
    }
  });
  if (updatedCategory) {
    return updatedCategory
  }
  throw new CategoryNotFoundException(id);
}
  
  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
