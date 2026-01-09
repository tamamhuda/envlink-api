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
import { RegisterBodyDto, RegisterRequest } from './dto/register.dto';
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
import {
  TokensDto,
  TokensResponse,
  TokensSerializerDto,
} from './dto/token.dto';
import { InvalidateCache } from 'src/infrastructure/cache/decorators/invalidate-cache.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  UserInfoDto,
  UserInfoResponse,
  UserInfoSerializerDto,
} from './dto/user-info.dto';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { JWT_REFRESH_SECURITY } from 'src/config/jwt.config';
import { ClientUrl } from 'src/infrastructure/internal-services/request/decorators/client-url.decorator';
import { LoginRequest } from './dto/login.dto';
import { TurnstileGuard } from 'src/security/guards/turnstile.guard';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import {
  ResetPasswordBodyDto,
  ResetPasswordRequest,
} from './dto/reset-password.dto';
import {
  ForgotPasswordBodyDto,
  ForgotPasswordRequest,
} from './dto/forgot-password.dto';
import { SkipThrottle } from 'src/infrastructure/internal-services/throttle/decorators/skip-throttle.decorator';
import { ThrottleScope } from 'src/infrastructure/internal-services/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/infrastructure/internal-services/throttle/throttle.constants';
import { Public } from 'src/security/decorators/public.decorator';

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
  @UseGuards(TurnstileGuard)
  @ApiOperation({
    operationId: 'Register',
    summary: 'Register a new account',
  })
  @ApiBody({
    type: RegisterRequest,
    description: 'Request body for registering a new account',
  })
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Registration successful',
  })
  @ApiHeaders([
    {
      name: 'x-client-url',
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
  @UseGuards(TurnstileGuard)
  @ApiOperation({ operationId: 'Login', summary: 'Login an account' })
  @ApiOkResponse({
    type: AuthenticatedResponse,
    description: 'Login successful',
  })
  @ApiBody({
    type: LoginRequest,
    description: 'Request body for logging in an account',
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

  @Post('refresh')
  @SkipThrottle()
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth(JWT_REFRESH_SECURITY)
  @ApiOperation({ operationId: 'Refresh', summary: 'Refresh token' })
  @ApiOkResponse({
    type: TokensResponse,
    description: 'Refresh token successful',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TokensSerializerDto)
  async refreshToken(@Req() req: Request): Promise<TokensDto> {
    return await this.authService.refresh(req.user, req);
  }

  @SkipThrottle()
  @Get('verify')
  @ApiOperation({ operationId: 'Verify', summary: 'Verify email' })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Verify email successful',
  })
  @ZodSerializerDto(UserInfoSerializerDto)
  async verify(@Query('token') token: string): Promise<UserInfoDto> {
    return await this.authService.verify(token);
  }

  @Post('forgot-password')
  @ThrottleScope(PolicyScope.FORGOT_PASSWORD)
  @UseGuards(TurnstileGuard)
  @ApiOperation({ operationId: 'ForgotPassword', summary: 'Forgot password' })
  @ApiBody({
    type: ForgotPasswordRequest,
    description: 'Request Body for forgot password',
    required: true,
  })
  @ApiOkResponse({
    type: OkResponse,
    description: 'Forgot password successful',
  })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordBodyDto): Promise<OkDto> {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @SkipThrottle()
  @ApiOperation({ operationId: 'ResetPassword', summary: 'Reset password ' })
  @ApiBody({
    type: ResetPasswordRequest,
    description: 'Request Body for resetting password',
    required: true,
  })
  @ApiOkResponse({
    type: OkResponse,
    description: 'Reset password successful',
  })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordBodyDto): Promise<OkDto> {
    return await this.authService.resetPassword(body.token, body.password);
  }
}
