import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_REFRESH_STRATEGY } from 'src/config/jwt.config';
import { UserInfoDto } from '../dto/user-info.dto';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Request } from 'express';
import LoggerService from 'src/common/logger/logger.service';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    config: ConfigService<Env>,
    private readonly sessionService: SessionService,
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
    const { user } = await this.sessionService.validateCurrentSession(
      payload,
      request,
      true,
    );
    return user;
  }
}
