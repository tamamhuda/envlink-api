import {
  Body,
  Controller,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
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
import { UserInfoResponse } from 'src/auth/dto/user-info.dto';

@ApiBearerAuth(JWT_SECURITY)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SkipThrottle()
  @Post('logout')
  @ApiNoContentResponse({
    description: 'Logout successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @InvalidateCache(
    CachePrefix.SESSION,
    ({ session, user }) => `${user?.id}:${session?.id}`,
  )
  async logout(@Req() req: Request): Promise<void> {
    await this.accountService.logout(req);
  }

  @Post('/verify/resend')
  @ThrottleScope(PolicyScope.RESEND_EMAIL)
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
    return await this.accountService.resendVerifyEmail(req, redirectUrl);
  }

  @Post('change-password')
  @ThrottleScope(PolicyScope.CHANGE_PASSWORD)
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
    ({ session, user }) => `${user?.id}:${session?.id}`,
  )
  async changePassword(@Req() req: Request, @Body() body: ChangePasswordDto) {
    return await this.accountService.changePassword(req, body);
  }
}
