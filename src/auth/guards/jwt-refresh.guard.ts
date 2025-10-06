import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_STRATEGY } from 'src/config/jwt.config';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY) {
  handleRequest<UserInfoDto = any>(
    err: any,
    user: UserInfoDto,
    info: any,
  ): UserInfoDto {
    if (info instanceof TokenExpiredError)
      throw new UnauthorizedException('Token expired');

    if (info instanceof JsonWebTokenError)
      throw new UnauthorizedException('Invalid token');

    if (err || !user) {
      throw new UnauthorizedException('Invalid Authorization');
    }
    return user;
  }
}
