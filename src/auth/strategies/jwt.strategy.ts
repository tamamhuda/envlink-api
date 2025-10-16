import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JWT_ACCESS_STRATEGY } from 'src/config/jwt.config';
import { UserInfoDto } from '../dto/user-info.dto';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Request } from 'express';
import LoggerService from 'src/common/logger/logger.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { SessionInfoDto } from 'src/session/dto/session.dto';
import { CacheService } from 'src/common/cache/cache.service';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY,
) {
  constructor(
    config: ConfigService<Env>,
    private readonly sessionService: SessionService,

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

  async validateAndSetSessionCache(
    payload: JwtPayload,
    req: Request,
    exp: number,
    key: string,
  ): Promise<UserInfoDto> {
    const sessionInfo = await this.sessionService.validateCurrentSession(
      payload,
      req,
    );

    const now = Date.now();
    const ttl = exp * 1000 - now;
    await this.cache.set(CachePrefix.SESSION, key, sessionInfo, ttl);

    return sessionInfo.user;
  }

  async validate(req: Request, payload: JwtPayload): Promise<UserInfoDto> {
    const { sub, sessionId, exp } = payload;
    const key = `${sub}:${sessionId}`;

    const sessionCached = await this.cache.getCache<SessionInfoDto>(
      CachePrefix.SESSION,
      key,
    );

    if (sessionCached) return sessionCached.user;

    return await this.validateAndSetSessionCache(payload, req, exp, key);
  }
}
