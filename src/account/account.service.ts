import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from 'src/database/entities/account.entity';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { AccountRepository } from 'src/database/repositories/account.repository';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

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
}
