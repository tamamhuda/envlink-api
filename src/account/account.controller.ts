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
  ApiConflictResponse,
  ApiHeaders,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { InvalidateCache } from 'src/common/decorators/invalidate-cache.decorator';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { Request } from 'express';
import { ZodString } from 'zod';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import {
  UserInfoDto,
  UserInfoResponse,
  UserInfoSerializer,
} from 'src/auth/dto/user-info.dto';
import { AccountVerifyService } from './account-verify.service';
import { ClientUrl } from 'src/common/decorators/client-url.decorator';
import { ZodSerializerDto } from 'nestjs-zod';

@ApiBearerAuth(JWT_SECURITY)
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly accountVerifyService: AccountVerifyService,
  ) {}

  @SkipThrottle()
  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
  })
  @ApiNoContentResponse({
    description: 'Logout successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @InvalidateCache(
    CachePrefix.SESSION,
    ({ sessionId, user }) => `${user?.id}:${sessionId}`,
  )
  async logout(@Req() req: Request): Promise<void> {
    await this.accountService.logout(req);
  }

  @Post('/verify/resend')
  @ThrottleScope(PolicyScope.RESEND_EMAIL)
  @ApiOperation({
    summary: 'Resend verification email',
  })
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
    summary: 'Change password',
  })
  @ApiOkResponse({
    type: UserInfoResponse,
    description: 'Change password successful',
  })
  @ApiBody({
    type: ChangePasswordDto,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @InvalidateCache(
    CachePrefix.SESSION,
    ({ sessionId, user }) => `${user?.id}:${sessionId}`,
  )
  @ZodSerializerDto(UserInfoSerializer)
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
  ): Promise<UserInfoDto> {
    return await this.accountService.changePassword(req, body);
  }
}
