import { ConflictException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AccountService } from 'src/account/account.service';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { JwtUtil } from 'src/common/utils/jwt.util';
import LoggerService from 'src/logger/logger.service';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { AuthenticatedDto } from './dto/authResponse.dto';
import { RegisterDto } from './dto/register.dto';
import { TokensDto } from './dto/token.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { SessionInfoDto } from 'src/session/dto/session.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IpUtil } from 'src/common/utils/ip.util';
import { InjectQueue } from '@nestjs/bullmq';
import { SEND_MAIL_VERIFY_QUEUE } from 'src/queue/queue.constans';
import { Queue } from 'bullmq';
import { SendMailVerifyJob } from 'src/queue/interfaces/mail-verify.interface';

@Injectable()
export class AuthService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();

  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService,
    private readonly jwtUtil: JwtUtil,
    private readonly ipUtil: IpUtil,
    private readonly logger: LoggerService,
    private readonly urlGeratorService: UrlGeneratorService,
    @InjectQueue(SEND_MAIL_VERIFY_QUEUE)
    private readonly mailVerifyQueue: Queue<SendMailVerifyJob>,
  ) {}

  async register(
    registerDto: RegisterDto,
    req: Request,
  ): Promise<AuthenticatedDto> {
    const { password, redirectUrl, ...userDto } = registerDto;

    const passwordHash = await this.bcryptUtil.hashPassword(password);

    const { user, account, session } =
      await this.userService.createUserWithAccountAndSession(
        userDto,
        passwordHash,
      );
    const userInfo = await this.userService.mapToUserInfoDto(account, user);

    const { id, role, email, fullName } = user;

    const emailVerificationToken = await this.jwtUtil.assignVerifyEmailToken(
      id,
      role,
      session.id,
    );
    const verifyLink = this.urlGeratorService.generateUrlFromPath({
      relativePath: 'auth/verify',
      query: {
        token: emailVerificationToken,
        redirectUrl,
      },
    });

    await this.mailVerifyQueue.add('EmailVerification', {
      email,
      firstName: fullName,
      verifyLink,
    });

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

    return await this.userService.mapToUserInfoDto(account, account.user);
  }

  async validateJwtPayload(
    payload: JwtPayload,
    req: Request,
    type: 'access' | 'refresh',
    isExpired?: boolean,
  ): Promise<SessionInfoDto> {
    const session = await this.sessionService.validateCurrentSession(
      payload.sessionId,
      isExpired,
    );

    await this.sessionService.validateSessionTokens(session, req, type);
    return this.sessionService.mapSessionToDto(session);
  }

  async signInLocalAccount(req: Request): Promise<AuthenticatedDto> {
    const account = await this.accountService.findOneByProviderAccountId(
      req.user.id,
    );

    const { session, tokens } =
      await this.sessionService.createSessionWithTokens(account, req);
    const userInfo = await this.userService.mapToUserInfoDto(
      session.account,
      session.user,
    );

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
      sessionId,
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

  async verify(token: string): Promise<UserInfoDto | string> {
    try {
      const { sub } = await this.jwtUtil.verifyEmailToken(token);
      const account = await this.accountService.findOneByProviderAccountId(sub);
      const { user } = await this.accountService.update(account, {
        isVerified: true,
        verifiedAt: new Date(),
      });
      return await this.userService.mapToUserInfoDto(account, user);
    } catch (error) {
      if (error instanceof TokenExpiredError)
        return 'Email link verification is expired';
      if (error instanceof JsonWebTokenError)
        return 'Email link verification is invalid';
      throw error;
    }
  }

  async resendVerifyEmail(req: Request, redirectUrl?: string): Promise<string> {
    const { sub, role, sessionId } =
      await this.jwtUtil.extractJwtPayloadFromHeader(req, 'access');

    const {
      user: { email, fullName },
      isVerified,
    } = await this.accountService.findOneByProviderAccountId(sub);

    if (isVerified) throw new ConflictException('Account already verified');

    const token = await this.jwtUtil.assignVerifyEmailToken(
      sub,
      role,
      sessionId,
    );

    const verifyLink = this.urlGeratorService.generateUrlFromPath({
      relativePath: 'auth/verify',
      query: {
        token,
        redirectUrl,
      },
    });

    await this.mailVerifyQueue.add('EmailVerification', {
      email,
      firstName: fullName,
      verifyLink,
    });

    return 'OK';
  }

  async changePassword(req: Request, body: ChangePasswordDto) {
    const { oldPassword, newPassword } = body;

    const { email } = req.user;
    const existingAccount =
      await this.accountService.validateAccountCredentials(email, oldPassword);

    const passwordHash = await this.bcryptUtil.hashPassword(newPassword);

    const account = await this.accountService.update(existingAccount, {
      passwordHash,
    });

    return this.userService.mapToUserInfoDto(account, account.user);
  }
}
