import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_ACCESS_STRATEGY } from 'src/config/jwt.config';
import { UserInfoDto } from '../dto/user-info.dto';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Request } from 'express';
import LoggerService from 'src/logger/logger.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { SessionInfoDto } from 'src/session/dto/session.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY,
) {
  constructor(
    config: ConfigService<Env>,
    private readonly authService: AuthService,

    private readonly cache: CacheService,
    private readonly logger: LoggerService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  private async setSessionCache(
    sessionInfo: SessionInfoDto,
    payload: JwtPayload,
    key: string,
  ) {
    const { exp } = payload;
    const now = Date.now();
    const ttl = exp * 1000 - now;
    await this.cache.set(CachePrefix.SESSION, key, sessionInfo, ttl);
  }

  async validate(req: Request, payload: JwtPayload): Promise<UserInfoDto> {
    const { sub, sessionId } = payload;
    const key = `${sub}:${sessionId}`;

    const sessionCached = await this.cache.getCache<SessionInfoDto>(
      CachePrefix.SESSION,
      key,
    );

    if (sessionCached) {
      return sessionCached.user;
    }

    const sessionInfo = await this.authService.validateJwtPayload(
      payload,
      req,
      'access',
    );

    await this.setSessionCache(sessionInfo, payload, key);

    return sessionInfo.user;
  }
}
