import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBodyDto } from './dto/register.dto';
import {
  ApiOkResponse,
  ApiBearerAuth,
  ApiHeaders,
  ApiTags,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  AuthenticatedDto,
  AuthenticatedResponse,
  AuthenticatedSerializerDto,
} from './dto/authenticated.dto';
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
import { ClientUrl } from 'src/common/decorators/client-url.decorator';
import { LoginBodyDto } from './dto/login.dto';

@Controller('auth')
@Public()
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @ThrottleScope(PolicyScope.REGISTER)
  @ApiOperation({ summary: 'Register a new account' })
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Registration successful',
  })
  @ApiHeaders([
    {
      name: 'X-Client-Url',
      description: 'Client URL used for email verification',
      required: false,
    },
  ])
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(AuthenticatedSerializerDto)
  async register(
    @Body() registerDto: RegisterBodyDto,
    @Req() req: Request,
    @ClientUrl() clientUrl: string,
  ): Promise<AuthenticatedDto> {
    return await this.authService.register(registerDto, req, clientUrl);
  }

  @Post('login')
  @SkipThrottle()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login an account' })
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Login successful',
  })
  @ApiBody({
    type: LoginBodyDto,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache<AuthenticatedDto>(
    CachePrefix.USER,
    ({ res }) => `${res?.user.id}`,
  )
  @ZodSerializerDto(AuthenticatedSerializerDto)
  async login(@Req() req: Request): Promise<AuthenticatedDto> {
    return await this.authService.signInLocalAccount(req);
  }

  @SkipThrottle()
  @Post('refresh')
  @ApiBearerAuth(JWT_REFRESH_SECURITY)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiOkResponse({
    type: TokensResponse,
    description: 'Refresh token successful',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TokensDto)
  async refreshToken(@Req() req: Request): Promise<TokensDto> {
    return await this.authService.refresh(req.user, req);
  }

  @SkipThrottle()
  @Get('verify')
  @ApiOperation({ summary: 'Verify email' })
  @ApiOkResponse({
    type: UserInfoDto,
    description: 'Verify email successful',
  })
  async verify(@Query('token') token: string): Promise<UserInfoDto> {
    return await this.authService.verify(token);
  }
}
