import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import Post from "./entities/post.entity";
import {PostSearchResult} from "./types/postSearchResult.interface";
import {PostSearchBody} from "./types/postSearchBody.interface";

@Injectable()
export default class PostsSearchService {
  index = 'posts'

  constructor(
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async indexPost(post: Post) {
    return this.elasticsearchService.index<PostSearchBody>({
      index: this.index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id
      }
    })
  }

  async search(text: string) {
    const response = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'content']
          }
        }
      }
    })
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}