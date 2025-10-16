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
import { SessionInfoDto, sessionInfoSchema } from './dto/session.dto';
import { UserService } from 'src/user/user.service';
import { TokensDto } from 'src/auth/dto/token.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { IpUtil } from 'src/common/utils/ip.util';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class SessionService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();

  constructor(
    private readonly ipUtil: IpUtil,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtUtil: JwtUtil,
    private readonly userService: UserService,

    private readonly logger: LoggerService,
  ) {}

  @ZodSerializerDto(SessionInfoDto)
  async mapSessionToDto(session: Session): Promise<SessionInfoDto> {
    const { user, account } = session;

    const userInfo = await this.userService.mapToUserInfoDto(account, user);
    return sessionInfoSchema.parseAsync({
      ...session,
      user: userInfo,
    });
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

    if (!refreshTokenHash) throw new UnauthorizedException('Invalid session');

    if (isRevoked || !expiresAt)
      throw new UnauthorizedException('Invalid session');

    if (expiresAt && expiresAt < new Date()) {
      await this.updateSession(session, { isRevoked: true });
      throw new UnauthorizedException('Session expired');
    }

    const isTokenValid = await this.bcryptUtil.verifyToken(
      authorizationToken,
      refreshTokenHash,
    );

    if (!isTokenValid) throw new UnauthorizedException('Invalid session');
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
    return this.sessionRepository.manager.transaction(async (manager) => {
      // Step 1: Update account last login
      account.lastLoginAt = new Date();
      await manager.save(account);

      // Step 2: Create session (tokens null for now)
      const ipLocation = await this.ipUtil.getFormattedLocation(req);
      let session = manager.create(Session, {
        user: account.user,
        account,
        ipLocation,
        parsedUa: req.headers['user-agent'],
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
    const { sessionId } = await this.jwtUtil.extractJwtPayloadFromHeader(
      req,
      'access',
    );
    await this.revokeSessionById(sessionId);
  }

  async revokeSessionById(id: string) {
    const session = await this.findSessionById(id);
    await this.updateSession(session, {
      isRevoked: true,
      revokedAt: new Date(),
    });
  }

  async revokeAllSessions(req: Request) {
    await this.sessionRepository.updateManyByUserId(
      req.user.id,
      {
        isRevoked: true,
        revokedAt: new Date(),
      },
      false,
    );
  }

  async getAllUserSessions(
    req: Request,
    isActive: boolean = true,
  ): Promise<SessionInfoDto[]> {
    let sessionsDto: SessionInfoDto[] = [];
    const sessions = await this.sessionRepository.findManyByUserId(
      req.user.id,
      {
        isRevoked: !isActive,
      },
    );

    if (sessions.length > 0) {
      sessionsDto = await Promise.all(
        sessions.map(async (data) => await this.mapSessionToDto(data)),
      );
    }

    return sessionsDto;
  }
}
