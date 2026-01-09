import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import LoggerService from 'src/infrastructure/logger/logger.service';
import { JWT_ACCESS_STRATEGY } from 'src/config/jwt.config';
import { IS_PUBLIC_KEY } from 'src/security/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<UserInfoDto = any>(
    err: any,
    user: UserInfoDto,
    info: any,
  ): UserInfoDto {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('TOKEN_INVALID');
    }
    if (err || !user) {
      throw new UnauthorizedException('AUTHORIZATION_FAILED');
    }
    return user;
  }
}
