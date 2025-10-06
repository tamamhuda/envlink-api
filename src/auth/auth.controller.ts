import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  ApiOkResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiPermanentRedirectResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  AuthenticatedDto,
  AuthenticatedResponse,
} from './dto/authResponse.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { TokensDto, TokensResponse } from './dto/token.dto';
import { JwtGuard } from './guards/jwt.guard';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserInfoDto } from './dto/user-info.dto';
import LoggerService from 'src/logger/logger.service';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { ZodString } from 'zod';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Registration successful',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(AuthenticatedDto)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthenticatedDto> {
    return await this.authService.register(registerDto, req);
  }

  @Post('login')
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Login successful',
  })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @InvalidateCache<AuthenticatedDto>(
    CachePrefix.USER,
    ({ res }) => `${res?.user.id}`,
  )
  @ZodSerializerDto(AuthenticatedDto)
  async login(@Req() req: Request): Promise<AuthenticatedDto> {
    return await this.authService.signInLocalAccount(req);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOkResponse({
    type: TokensResponse,
    description: 'Refresh token successful',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TokensDto)
  async refreshToken(@Req() req: Request): Promise<TokensDto> {
    return await this.authService.refresh(req.user, req);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'Logout successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    await this.authService.logout(req);
  }

  @Get('verify')
  @ApiOkResponse({
    type: UserInfoDto,
  })
  @ApiPermanentRedirectResponse({
    description: 'Verify email successful with redirect url',
  })
  @HttpCode(HttpStatus.OK || HttpStatus.PERMANENT_REDIRECT)
  async verify(
    @Res() res: Response,
    @Query('token') token: string,
    @Query('redirectUrl', new DefaultValuePipe(undefined))
    redirectUrl: string,
  ): Promise<UserInfoDto | string> {
    const userInfo = await this.authService.verify(token);
    this.logger.log(redirectUrl);
    if (redirectUrl)
      res.status(HttpStatus.PERMANENT_REDIRECT).redirect(redirectUrl);
    return userInfo;
  }

  @Post('/verify/resend')
  @ApiBearerAuth(JWT_SECURITY)
  @ApiOkResponse({
    type: ZodString,
    description: 'Resend verify email successful',
    examples: {
      OK: {
        summary: 'Ok',
        value: 'OK',
      },
    },
  })
  @ApiConflictResponse({
    type: ZodString,
    description: 'Resend verify email unsuccessful',
    examples: {
      CONFLICT: {
        summary: 'Conflict',
        value: 'Account already verified',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async resendVerifyEmail(
    @Req() req: Request,
    @Query('redirectUrl', new DefaultValuePipe(undefined))
    redirectUrl: string,
  ): Promise<string> {
    return await this.authService.resendVerifyEmail(req, redirectUrl);
  }
}
