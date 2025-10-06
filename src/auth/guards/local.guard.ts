import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<UserInfoDto = any>(err: any, user: UserInfoDto): UserInfoDto {
    if (err || !user) {
      throw err || new UnauthorizedException(`Invalid credentials`);
    }
    return user;
  }
}
