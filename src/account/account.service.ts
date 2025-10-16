import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Account } from 'src/database/entities/account.entity';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { AccountRepository } from 'src/database/repositories/account.repository';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { SessionService } from 'src/session/session.service';
import { Request } from 'express';
import { JwtUtil } from 'src/common/utils/jwt.util';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendMailVerifyJob } from 'src/queue/interfaces/mail-verify.interface';
import { SEND_MAIL_VERIFY_QUEUE } from 'src/queue/queue.constans';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AccountService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly jwtUtil: JwtUtil,
    private readonly urlGeratorService: UrlGeneratorService,
    @InjectQueue(SEND_MAIL_VERIFY_QUEUE)
    private readonly mailVerifyQueue: Queue<SendMailVerifyJob>,
  ) {}

  async findOneByProviderUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<Account> {
    const isEmail = usernameOrEmail.includes('@');

    const account =
      await this.accountRepository.findOneByProviderEmailOrUsername(
        ProviderEnum.LOCAL,
        usernameOrEmail,
      );

    if (!account) {
      throw new NotFoundException(
        isEmail ? 'Email not found' : 'Username not found',
      );
    }

    return account;
  }

  async findOneByProviderAccountId(
    providerAccountId: string,
  ): Promise<Account> {
    const account =
      await this.accountRepository.findOneByProviderAccountId(
        providerAccountId,
      );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(account: Account, data: Partial<Account>): Promise<Account> {
    return await this.accountRepository.updateOne(account, data);
  }

  async validateUniqueAccountByProviderEmailAndUsername(
    providerEmail: string,
    providerUsername: string,
    provider: ProviderEnum,
  ): Promise<string | null> {
    const existingAccount =
      await this.accountRepository.findOneByProviderEmailAndUsername(
        provider,
        providerEmail,
        providerUsername,
      );

    if (existingAccount) {
      return 'Local account already exists for this user';
    }
    return null;
  }

  async validateUniqueAccountByProviderAccountId(
    provider: ProviderEnum,
    providerAccountId: string,
  ): Promise<string | null> {
    const existingAccount =
      await this.accountRepository.findOneByProviderAndProviderAccountId(
        provider,
        providerAccountId,
      );

    if (existingAccount) {
      return 'Local account already exists for this user';
    }
    return null;
  }

  async validateAccountCredentials(emailOrUsername: string, passowrd: string) {
    const account =
      await this.findOneByProviderUsernameOrEmail(emailOrUsername);

    const isPasswordValid = await this.bcryptUtil.comparePassword(
      passowrd,
      account.passwordHash as string,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return account;
  }

  async logout(req: Request) {
    await this.sessionService.revokeCurrentSession(req);
  }

  async resendVerifyEmail(req: Request, redirectUrl?: string): Promise<string> {
    const { sub, role, sessionId } =
      await this.jwtUtil.extractJwtPayloadFromHeader(req, 'access');

    const {
      user: { email, fullName },
      isVerified,
    } = await this.findOneByProviderAccountId(sub);

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
    const existingAccount = await this.validateAccountCredentials(
      email,
      oldPassword,
    );

    const passwordHash = await this.bcryptUtil.hashPassword(newPassword);

    const account = await this.update(existingAccount, {
      passwordHash,
    });

    return this.userService.mapToUserInfoDto(account, account.user);
  }
}
