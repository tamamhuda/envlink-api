import {
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
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { UserInfoDto } from 'src/auth/dto/user-info.dto';

@Injectable()
export class AccountService {
  private readonly bcryptUtil: BcryptUtil = new BcryptUtil();
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly sessionService: SessionService,
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
    body: ChangePasswordDto,
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
}
