import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Account } from 'src/database/entities/account.entity';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { AccountRepository } from 'src/database/repositories/account.repository';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { SessionService } from 'src/sessions/session.service';
import { Request } from 'express';
import { ChangePasswordBodyDto } from 'src/auth/dto/change-password.dto';
import { UserInfoDto } from 'src/auth/dto/user-info.dto';
import LoggerService from 'src/common/logger/logger.service';
import { Profile } from 'passport-google-oauth20';
import { User } from 'src/database/entities/user.entity';
import { TokensDto } from 'src/auth/dto/token.dto';
import { EntityManager } from 'typeorm';
import Plan from 'src/database/entities/plan.entity';
import { PlanEnum } from 'src/common/enums/plans.enum';
import Subscription from 'src/database/entities/subscription.entity';
import { XenditService } from 'src/common/xendit/xendit.service';
import { GoogleProfile } from 'src/common/interfaces/google-profile.interface';

@Injectable()
export class AccountService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly sessionService: SessionService,
    private readonly xenditService: XenditService,
    private readonly logger: LoggerService,
  ) {}

  async findOneByProviderUsernameOrEmail(
    usernameOrEmail: string,
    provider: ProviderEnum,
  ): Promise<Account> {
    const isEmail = usernameOrEmail.includes('@');

    const account =
      await this.accountRepository.findOneByProviderEmailOrUsername(
        provider,
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

  async validateAccountCredentials(emailOrUsername: string, passowrd: string) {
    const account = await this.findOneByProviderUsernameOrEmail(
      emailOrUsername,
      ProviderEnum.LOCAL,
    );

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

  async changePassword(
    req: Request,
    body: ChangePasswordBodyDto,
  ): Promise<UserInfoDto> {
    const { oldPassword, newPassword } = body;

    const { email } = req.user;
    const existingAccount = await this.validateAccountCredentials(
      email,
      oldPassword,
    );

    const passwordHash = await this.bcryptUtil.hashPassword(newPassword);

    await this.update(existingAccount, {
      passwordHash,
    });
    return req.user;
  }

  private validateGoogleProfile(profile: GoogleProfile) {
    const { id: providerAccountId, fullName, email: providerEmail } = profile;

    // ensure only alphanumeric characters and underscores
    const providerUsername = providerEmail
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '');

    return {
      providerAccountId,
      providerUsername,
      providerEmail,
      fullName,
    };
  }

  async findAccountByGoogleProviderWithTokens(
    providerAccountId: string,
    req: Request,
  ): Promise<{ account: Account | null; tokens: TokensDto | null }> {
    const account =
      await this.accountRepository.findOneByProviderAndProviderAccountId(
        ProviderEnum.GOOGLE,
        providerAccountId,
      );

    if (account) {
      const { tokens } = await this.sessionService.createSessionWithTokens(
        account,
        req,
      );
      return { tokens, account };
    }
    return { account: null, tokens: null };
  }

  private async generateUniqueUsername(
    base: string,
    manager: EntityManager,
  ): Promise<string> {
    let username = base;

    const exists = async (value: string) =>
      manager.findOne(User, { where: { username: value } });

    while (await exists(username)) {
      const suffix = Math.floor(Math.random() * 10000);
      username = `${base}-${suffix}`;
    }

    return username;
  }

  async createAccountByGoogleWithTokens(
    profile: GoogleProfile,
    req: Request,
  ): Promise<{ tokens: TokensDto; account: Account }> {
    const { fullName, providerAccountId, providerEmail, providerUsername } =
      this.validateGoogleProfile(profile);

    const account = await this.accountRepository.manager.transaction(
      async (manager) => {
        let user = await manager.findOne(User, {
          where: { email: providerEmail },
        });

        // Case 1: brand new user
        if (!user) {
          const uniqueUsername = await this.generateUniqueUsername(
            providerUsername,
            manager,
          );

          user = manager.create(User, {
            email: providerEmail,
            fullName,
            username: uniqueUsername,
            provider: ProviderEnum.GOOGLE,
            providerAccountId,
          });

          const { id: externalId } =
            await this.xenditService.createCustomer(user);
          user.externalId = externalId;
          user = await manager.save(user);
        }

        const newAccount = manager.create(Account, {
          user,
          provider: ProviderEnum.GOOGLE,
          providerUsername: user.username,
          providerAccountId,
          providerEmail,
          isVerified: true,
        });

        // Create Subscription (Free Plan)
        const plan = await manager.findOneByOrFail(Plan, {
          name: PlanEnum.FREE,
        });

        const subscription = manager.create(Subscription, {
          user,
          plan,
        });
        subscription.initializeSubscriptionPeriod();
        await manager.save(subscription);

        await manager.update(User, user.id, {
          activeSubscription: subscription,
        });

        return await manager.save(newAccount, { reload: true });
      },
    );

    const { tokens } = await this.sessionService.createSessionWithTokens(
      account,
      req,
    );

    return { tokens, account };
  }
}
