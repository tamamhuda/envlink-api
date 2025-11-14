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
import { LoginRequest } from './dto/login.dto';

@Controller('auth')
@ApiTags('Authentication')
@Public()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @ThrottleScope(PolicyScope.REGISTER)
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
    type: UserInfoDto,
    description: 'Verify email successful',
  })
  async verify(@Query('token') token: string): Promise<UserInfoDto> {
    return await this.authService.verify(token);
  }
}
