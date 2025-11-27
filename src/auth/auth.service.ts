import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AccountService } from 'src/account/account.service';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { JwtUtil } from 'src/common/utils/jwt.util';
import LoggerService from 'src/common/logger/logger.service';
import { SessionService } from 'src/sessions/session.service';
import { UserService } from 'src/user/user.service';
import { AuthenticatedDto } from './dto/authenticated.dto';
import { RegisterBodyDto } from './dto/register.dto';
import { TokensDto } from './dto/token.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { IpUtil } from 'src/common/utils/ip.util';
import { AccountVerifyService } from 'src/account/account-verify.service';
import { UserMapper } from 'src/user/mapper/user.mapper';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class AuthService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();

  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService,
    private readonly jwtUtil: JwtUtil,
    private readonly userMapper: UserMapper,
    private readonly ipUtil: IpUtil,
    private readonly logger: LoggerService,
    private readonly accountVerifyService: AccountVerifyService,
  ) {}

  async register(
    registerBody: RegisterBodyDto,
    req: Request,
    clientUrl?: string,
  ): Promise<AuthenticatedDto> {
    const { password, ...userDto } = registerBody;

    const passwordHash = await this.bcryptUtil.hashPassword(password);

    const { user, account, session } =
      await this.userService.createUserWithAccountAndSession(
        userDto,
        passwordHash,
      );

    const userInfo = await this.userMapper.mapToUserInfoDto(account, user);

    const { id, role, email, fullName } = user;

    await this.accountVerifyService.send(id, email, fullName, clientUrl);

    const { accessToken, refreshToken } = await this.jwtUtil.signTokens(
      id,
      role,
      session.id,
    );

    const refreshTokenHash = await this.bcryptUtil.hashToken(refreshToken);
    const expiresAt = await this.jwtUtil.extractRefreshExpiresAt(refreshToken);
    const ipLocation = await this.ipUtil.getFormattedLocation(req);
    await this.sessionService.updateSession(session, {
      refreshTokenHash,
      expiresAt,
      ipLocation,
      userAgent: req.headers['user-agent'],
    });

    return { tokens: { accessToken, refreshToken }, user: userInfo };
  }

  async validateCredentialsByLocalProvider(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserInfoDto> {
    const account = await this.accountService.validateAccountCredentials(
      usernameOrEmail,
      password,
    );

    return await this.userMapper.mapToUserInfoDto(account, account.user);
  }

  async signInLocalAccount(req: Request): Promise<AuthenticatedDto> {
    const account = await this.accountService.findOneByProviderAccountId(
      req.user.id,
    );

    const {
      session: { user },
      tokens,
    } = await this.sessionService.createSessionWithTokens(account, req);
    const userInfo = await this.userMapper.mapToUserInfoDto(account, user);
    return { tokens, user: userInfo };
  }

  async refresh(user: UserInfoDto, req: Request): Promise<TokensDto> {
    const { sessionId } = await this.jwtUtil.extractJwtPayloadFromHeader(
      req,
      'refresh',
    );

    const session = await this.sessionService.findSessionById(sessionId);

    const { accessToken, refreshToken } = await this.jwtUtil.signTokens(
      user.id,
      user.role,
      session.id,
    );
    const refreshTokenHash = await this.bcryptUtil.hashToken(refreshToken);

    await this.sessionService.updateSession(session, {
      refreshTokenHash,
    });

    return { accessToken, refreshToken };
  }

  async logout(req: Request) {
    await this.sessionService.revokeCurrentSession(req);
  }

  async verify(token: string): Promise<UserInfoDto> {
    const account = await this.accountVerifyService.verify(token);

    return this.userMapper.mapToUserInfoDto(account, account.user);
  }
}
