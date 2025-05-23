import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import Post from "./entities/post.entity";
import {PostSearchResult} from "./types/postSearchResult.interface";
import {PostSearchBody} from "./types/postSearchBody.interface";
import PostCountResult from "./types/postCountBody.interface";

@Injectable()
export default class PostsSearchService {
    index = 'posts';

    constructor(
        private readonly elasticsearchService: ElasticsearchService
    ) {
    }

    async indexPost(post: Post) {
        return this.elasticsearchService.index<PostSearchBody>({
            index: this.index,
            document: {
                id: post.id,
                title: post.title,
                content: post.content,
                authorId: post.author.id
            }
        });
    }

    async count(query: string, fields: string[]) {
        const result = await this.elasticsearchService.count({
            index: this.index,
            query: {
                multi_match: {
                    query,
                    fields,
                },
            },
        });

        return result.count;
    }



    async search(text: string) {
        const result = await this.elasticsearchService.search<PostSearchResult>({
            index: this.index,
            query: {
                multi_match: {
                    query: text,
                    fields: ['title', 'content'],
                },
            },
        });

        const hits = result.hits.hits;
        return hits.map((item) => item._source);
    }


    async remove(postId: number) {
        await this.elasticsearchService.deleteByQuery({
            index: this.index,
            query: {
                match: {
                    id: postId,
                }
            }

        })
    }

    async update(post: Post) {
        const newBody: PostSearchBody = {
            id: post.id,
            title: post.title,
            content: post.content,
            authorId: post.author.id
        };

        const script = Object.entries(newBody).reduce((result, [key, value]) => {
            return `${result} ctx._source.${key}='${value}';`;
        }, '');

        await this.elasticsearchService.updateByQuery({
            index: this.index,
            query: {
                match: {
                    id: post.id,
                }
            },
            script: {
                source: script
            }
        });
    }

}