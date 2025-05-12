import {
    Body,
    Req,
    Controller,
    HttpCode,
    Post,
    UseGuards,
    Get,
    ClassSerializerInterceptor,
    UseInterceptors,
} from '@nestjs/common';
import {AuthenticationService} from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import {LocalAuthenticationGuard} from './localAuthentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';
// import {EmailConfirmationService} from '../emailConfirmation/emailConfirmation.service';
import {ApiBody} from '@nestjs/swagger';
import LogInDto from './dto/logIn.dto';
import { UsersService } from 'src/users/user.service';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly usersService: UsersService,
        // private readonly emailConfirmationService: EmailConfirmationService,
    ) {
    }

    @Post('register')
    async register(@Body() registrationData: RegisterDto) {
        return this.authenticationService.register(registrationData);
    }


    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-in')
    @ApiBody({type: LogInDto})
    async logIn(@Req() request: RequestWithUser) {
        const {user} = request;
        const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(
            user.id,
        );
        const {
            cookie: refreshTokenCookie,
            token: refreshToken,
        } = this.authenticationService.getCookieWithJwtRefreshToken(user.id);

        await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

        request.res.setHeader('Set-Cookie', [
            accessTokenCookie,
            refreshTokenCookie,
        ]);

        if (user.isTwoFactorAuthenticationEnabled) {
            return;
        }

        return user;
    }


    @UseGuards(JwtAuthenticationGuard)
    @Post('log-out')
    @HttpCode(200)
    async logOut(@Req() request: RequestWithUser) {
        await this.usersService.removeRefreshToken(request.user.id);
        request.res.setHeader(
            'Set-Cookie',
            this.authenticationService.getCookiesForLogOut(),
        );
    }


    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    }

}