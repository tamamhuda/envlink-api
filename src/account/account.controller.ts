import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeaders,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { Request } from 'express';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { JWT_SECURITY } from 'src/config/jwt.config';
import {
  ChangePasswordBodyDto,
  ChangePasswordRequest,
} from 'src/auth/dto/change-password.dto';
import {
  UserInfoDto,
  UserInfoResponse,
  UserInfoSerializerDto,
} from 'src/auth/dto/user-info.dto';
import { AccountVerifyService } from './account-verify.service';
import { ClientUrl } from 'src/common/decorators/client-url.decorator';
import { ZodSerializerDto } from 'nestjs-zod';
import LoggerService from 'src/common/logger/logger.service';

@Controller('account')
@ApiBearerAuth(JWT_SECURITY)
@ApiTags('Account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly accountVerifyService: AccountVerifyService,
    private readonly logger: LoggerService,
  ) {}

  @SkipThrottle()
  @Post('logout')
  @InvalidateCache(
    CachePrefix.SESSION,
    ({ sessionId, user }) => `${user?.id}:${sessionId}`,
  )
  @ApiOperation({
    operationId: 'Logout',
    summary: 'Logout user',
  })
  @ApiNoContentResponse({
    description: 'Logout successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    await this.accountService.logout(req);
  }

  @Post('/verify/resend')
  @ThrottleScope(PolicyScope.RESEND_EMAIL)
  @ApiOperation({
    operationId: 'Verify-Resend',
    summary: 'Resend verification email',
  })
  @ApiOkResponse({
    type: String,
    description: 'Resend verify email successful',
    examples: {
      OK: {
        summary: 'Ok',
        value: 'OK',
      },
    },
  })
  @ApiHeaders([
    {
      name: 'x-client-url',
      description: 'Client URL',
      required: false,
    },
  ])
  @HttpCode(HttpStatus.OK)
  async resendVerifyEmail(
    @Req() req: Request,
    @ClientUrl() clientUrl?: string,
  ): Promise<string> {
    return await this.accountVerifyService.resend(req.user.id, clientUrl);
  }

  @Post('change-password')
  @ThrottleScope(PolicyScope.CHANGE_PASSWORD)
  @ApiOperation({
    operationId: 'Change-Password',
    summary: 'Change password',
  })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Change password successful',
  })
  @ApiBody({
    type: ChangePasswordRequest,
    description: 'Request body for changing password',
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(
    CachePrefix.SESSION,
    ({ sessionId, user }) => `${user?.id}:${sessionId}`,
  )
  @ZodSerializerDto(UserInfoSerializerDto)
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordBodyDto,
  ): Promise<UserInfoDto> {
    return await this.accountService.changePassword(req, body);
  }
}
