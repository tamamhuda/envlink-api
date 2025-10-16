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
  ApiPermanentRedirectResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  AuthenticatedDto,
  AuthenticatedResponse,
} from './dto/authResponse.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { TokensDto, TokensResponse } from './dto/token.dto';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserInfoDto } from './dto/user-info.dto';
import LoggerService from 'src/common/logger/logger.service';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { Public } from 'src/common/decorators/public.decorator';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { JWT_REFRESH_SECURITY } from 'src/config/jwt.config';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @ThrottleScope(PolicyScope.REGISTER)
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
  @ThrottleScope(PolicyScope.LOGIN)
  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Login successful',
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache<AuthenticatedDto>(
    CachePrefix.USER,
    ({ res }) => `${res?.user.id}`,
  )
  @ZodSerializerDto(AuthenticatedDto)
  async login(@Req() req: Request): Promise<AuthenticatedDto> {
    return await this.authService.signInLocalAccount(req);
  }

  @SkipThrottle()
  @Post('refresh')
  @ApiBearerAuth(JWT_REFRESH_SECURITY)
  @UseGuards(JwtRefreshGuard)
  @ApiOkResponse({
    type: TokensResponse,
    description: 'Refresh token successful',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TokensDto)
  async refreshToken(@Req() req: Request): Promise<TokensDto> {
    return await this.authService.refresh(req.user, req);
  }

  @Public()
  @SkipThrottle()
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
    if (redirectUrl)
      res.status(HttpStatus.PERMANENT_REDIRECT).redirect(redirectUrl);
    return userInfo;
  }
}
