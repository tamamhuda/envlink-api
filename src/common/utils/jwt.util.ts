import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Env } from 'src/config/env.config';
import { getJwtOptions } from 'src/config/jwt.config';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';
import LoggerService from 'src/logger/logger.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class JwtUtil {
  private readonly verifyEmailOptions: JwtSignOptions;
  private readonly verifyExpiresIn = '5m';
  constructor(
    private readonly config: ConfigService<Env>,
    private readonly jwt: JwtService,
    private readonly logger: LoggerService,
  ) {
    this.verifyEmailOptions = {
      secret: this.config.getOrThrow('APP_SECRET'),
      expiresIn: this.verifyExpiresIn,
    };
  }

  private jwtOptions(type: 'access' | 'refresh') {
    return getJwtOptions(this.config, type);
  }

  async assignAccessToken(sub: string, role: RolesEnum, sessionId: string) {
    return this.jwt.signAsync(
      { jti: randomUUID().toString(), sub, role, sessionId },
      this.jwtOptions('access'),
    );
  }

  async assignRefreshToken(sub: string, role: RolesEnum, sessionId: string) {
    return this.jwt.signAsync(
      { jti: randomUUID().toString(), sub, role, sessionId },
      this.jwtOptions('refresh'),
    );
  }

  async assignVerifyEmailToken(
    sub: string,
    role: RolesEnum,
    sessionId: string,
  ) {
    return this.jwt.signAsync(
      { jti: randomUUID().toString(), sub, role, sessionId },
      this.verifyEmailOptions,
    );
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync(token, this.jwtOptions('refresh'));
  }

  async verifyEmailToken(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync(token, this.verifyEmailOptions);
  }

  async extractRefreshExpiresAt(token: string): Promise<Date> {
    const payload = await this.verifyRefreshToken(token);
    return new Date(payload.exp * 1000);
  }

  async extractRefreshSessionId(token: string): Promise<string> {
    const payload = await this.verifyRefreshToken(token);
    return payload.sessionId;
  }

  extractAuthorizationHeader(req: Request) {
    const token = req.headers.authorization?.substring(7);
    if (!token) throw new UnauthorizedException();
    return token;
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync(token, this.jwtOptions('access'));
  }

  async extractJwtPayloadFromHeader(req: Request, type: 'access' | 'refresh') {
    const token = this.extractAuthorizationHeader(req);
    if (type === 'access') {
      return await this.verifyAccessToken(token);
    }
    return await this.verifyRefreshToken(token);
  }

  async signTokens(
    sub: string,
    role: RolesEnum,
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.assignAccessToken(sub, role, sessionId);
    const refreshToken = await this.assignRefreshToken(sub, role, sessionId);
    return { accessToken, refreshToken };
  }
}
