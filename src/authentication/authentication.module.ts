import {Module} from '@nestjs/common';
import {AuthenticationService} from './authentication.service';
import {AuthenticationController} from './authentication.controller';
import {PassportModule} from '@nestjs/passport';
import {LocalStrategy} from './local.strategy';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from "./jwt.strategy";
import {UsersModule} from "../users/user.module";

@Module({
    imports: [UsersModule, PassportModule,

        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
                },
            }),
        }),

    ] as const,
    providers: [AuthenticationService, LocalStrategy, JwtStrategy] as const,
    controllers: [AuthenticationController] as const,
})
export class AuthenticationModule {
}