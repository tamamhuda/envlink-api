import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserInfoDto } from 'src/auth/dto/user-info.dto';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfoDto => {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return req.user;
  },
);
