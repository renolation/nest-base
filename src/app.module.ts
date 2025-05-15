import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import {UsersModule} from "./users/user.module";
import {AuthenticationModule} from "./authentication/authentication.module";
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST'),
                port: parseInt(configService.get<string>('POSTGRES_PORT', '5432'), 10),
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DB'),
                autoLoadEntities: true,
                ssl: {
                    rejectUnauthorized: false, // Needed for Neon and similar managed DBs
                },
                synchronize: true, // Disable in production
            }),
        }),
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRATION_TIME: Joi.string().required(),
            })
        }),
        UsersModule,
        AuthenticationModule,
        PostsModule,
        CategoriesModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}