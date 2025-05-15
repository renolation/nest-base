import {HttpAdapterHost, NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import * as cookieParser from 'cookie-parser';
import {ClassSerializerInterceptor, ValidationPipe} from "@nestjs/common";
import {ExceptionsLoggerFilter} from "./utils/exceptionsLogger.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
    const {httpAdapter} = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsLoggerFilter(httpAdapter));

    app.useGlobalInterceptors(new ClassSerializerInterceptor(
        app.get(Reflector))
    );
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
