import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthGuard } from '@nestjs/passport';
import { JWT_ACCESS_STRATEGY } from 'src/config/jwt.config';
import LoggerService from 'src/logger/logger.service';

@Injectable()
export class JwtGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  constructor(private readonly logger: LoggerService) {
    super();
  }

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
