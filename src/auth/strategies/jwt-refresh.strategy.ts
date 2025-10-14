import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_REFRESH_STRATEGY } from 'src/config/jwt.config';
import { UserInfoDto } from '../dto/user-info.dto';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Request } from 'express';
import LoggerService from 'src/common/logger/logger.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    config: ConfigService<Env>,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
      ignoreExpiration: true,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<UserInfoDto> {
    const { user } = await this.authService.validateJwtPayload(
      payload,
      request,
      'refresh',
    );
    return user;
  }
}
