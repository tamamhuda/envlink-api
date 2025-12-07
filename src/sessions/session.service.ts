import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Account } from 'src/database/entities/account.entity';
import Session from 'src/database/entities/session.entity';
import { SessionRepository } from 'src/database/repositories/session.repository';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { JwtUtil } from 'src/common/utils/jwt.util';
import LoggerService from 'src/common/logger/logger.service';
import { SessionInfoDto } from './dto/session.dto';
import { TokensDto } from 'src/auth/dto/token.dto';
import { IpUtil } from 'src/common/utils/ip.util';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UserMapper } from 'src/user/mapper/user.mapper';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { ClientIdentityUtil } from 'src/common/utils/client-identity.util';

@Injectable()
export class SessionService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();

  constructor(
    private readonly ipUtil: IpUtil,
    private readonly clientIdentityUtil: ClientIdentityUtil,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtUtil: JwtUtil,
    private readonly userMapper: UserMapper,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {}

  async mapSessionToDto(
    session: Session,
    isCurrent: boolean = false,
  ): Promise<SessionInfoDto> {
    const { user, account } = session;

    const userInfo = await this.userMapper.mapToUserInfoDto(account, user);
    return {
      ...session,
      isCurrent,
      user: userInfo,
    };
  }

  async findSessionById(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOneById(id);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async getSessionById(id: string): Promise<SessionInfoDto> {
    const session = await this.findSessionById(id);
    return await this.mapSessionToDto(session);
  }

  async updateSession(session: Session, partialSession: Partial<Session>) {
    return this.sessionRepository.updateOne(session, partialSession);
  }

  async validateSessionTokens(session: Session, req: Request) {
    const authorizationToken = this.jwtUtil.extractAuthorizationHeader(req);
    const { isRevoked, expiresAt, refreshTokenHash } = session;

    if (isRevoked || !expiresAt || !refreshTokenHash)
      throw new UnauthorizedException('SESSION_INVALID');

    if (expiresAt && expiresAt < new Date()) {
      await this.updateSession(session, { isRevoked: true });
      throw new UnauthorizedException('SESSION_EXPIRED');
    }

    const isTokenValid = await this.bcryptUtil.verifyToken(
      authorizationToken,
      refreshTokenHash,
    );

    if (!isTokenValid) throw new UnauthorizedException('SESSION_INVALID');
  }

  async validateCurrentSession(
    payload: JwtPayload,
    req: Request,
    isRefresh: boolean = false,
  ): Promise<SessionInfoDto> {
    const { sessionId } = payload;
    const session = await this.findSessionById(sessionId);
    if (isRefresh) await this.validateSessionTokens(session, req);

    return this.mapSessionToDto(session);
  }

  async createSessionWithTokens(
    account: Account,
    req: Request,
  ): Promise<{ session: Session; tokens: TokensDto }> {
    return await this.sessionRepository.manager.transaction(async (manager) => {
      // Step 1: Update account last login
      account.lastLoginAt = new Date();
      await manager.save(account);

      // Step 2: Create session (tokens null for now)
      const ipLocation = await this.ipUtil.getFormattedLocation(req);
      const { browser, os, deviceType } =
        this.clientIdentityUtil.parseUserAgent(req.headers['user-agent'] || '');
      let session = manager.create(Session, {
        user: account.user,
        account,
        ipLocation,
        userAgent: req.headers['user-agent'],
        browser,
        os,
        deviceType,
      });
      session = await manager.save(session);

      // Step 3: Sign tokens with session.id
      const tokens = await this.jwtUtil.signTokens(
        account.user.id,
        account.user.role,
        session.id,
      );
      const { refreshToken } = tokens;

      // Step 4: Update session with refresh token
      const refreshTokenHash = await this.bcryptUtil.hashToken(refreshToken);
      const expiresAt =
        await this.jwtUtil.extractRefreshExpiresAt(refreshToken);
      session.refreshTokenHash = refreshTokenHash;
      session.expiresAt = expiresAt;
      await manager.save(session);

      return { session, tokens };
    });
  }

  async revokeCurrentSession(req: Request) {
    const { sessionId, jti, ttl } =
      await this.jwtUtil.extractJwtPayloadFromHeader(req, 'access');
    await this.cache.set<boolean>(
      CachePrefix.TOKENS,
      `BLACKLIST:${jti}`,
      true,
      ttl,
    );
    await this.revokeSessionById(sessionId);
  }

  async revokeSessionById(id: string) {
    const session = await this.findSessionById(id);
    await this.updateSession(session, {
      isRevoked: true,
      revokedAt: new Date(),
    });
    this.logger.log(`Revoking session ${id}`);
  }

  async revokeAllSessions(req: Request, keepCurrent: boolean = false) {
    const sessionId = await this.jwtUtil.extractSessionIdFromHeader(req);
    await this.sessionRepository.revokeAll(req.user.id, {
      keepCurrent,
      currentSessionId: sessionId,
    });
  }

  async getAllUserSessions(
    req: Request,
    isActive: boolean = true,
  ): Promise<SessionInfoDto[]> {
    const sessionId = await this.jwtUtil.extractSessionIdFromHeader(req);
    let sessionsDto: SessionInfoDto[] = [];
    const sessions = await this.sessionRepository.findManyByUserId(
      req.user.id,
      {
        isRevoked: !isActive,
      },
    );

    if (sessions.length > 0) {
      sessionsDto = await Promise.all(
        sessions.map(async (data) =>
          this.mapSessionToDto(data, data.id === sessionId),
        ),
      );
    }

    return sessionsDto;
  }
}
