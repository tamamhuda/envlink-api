import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { DataSource, Repository } from 'typeorm';
import { ProviderEnum } from 'src/common/enums/provider.enum';

@Injectable()
export class AccountRepository extends Repository<Account> {
  constructor(dataSource: DataSource) {
    super(Account, dataSource.createEntityManager());
  }
  async findOneById(id: string): Promise<Account | null> {
    return await this.findOne({ where: { id }, relations: ['user'] });
  }

  async findOneByProviderAccountId(
    providerAccountId: string,
  ): Promise<Account | null> {
    return await this.findOne({
      where: { providerAccountId },
      relations: ['user'],
    });
  }

  async findOneByProviderEmailAndUsername(
    provider: ProviderEnum,
    providerEmail: string,
    providerUsername: string,
  ): Promise<Account | null> {
    return await this.findOne({
      where: { provider, providerEmail, providerUsername },
      relations: ['user'],
    });
  }

  async findOneByProviderAndProviderAccountId(
    provider: ProviderEnum,
    providerAccountId: string,
  ): Promise<Account | null> {
    return await this.findOne({
      where: { provider, providerAccountId },
      relations: ['user'],
    });
  }

  async findOneByProviderAndProviderEmail(
    provider: ProviderEnum,
    providerEmail: string,
  ): Promise<Account | null> {
    return await this.findOne({
      where: { provider, providerEmail },
      relations: ['user'],
    });
  }

  async findOneByproviderUsernameAndPasswordHash(
    providerUsername: string,
    passwordHash: string,
  ): Promise<Account | null> {
    return await this.findOne({
      where: { providerUsername, passwordHash },
      relations: ['user'],
    });
  }

  async findOneByProviderEmailOrUsername(
    provider: ProviderEnum,
    emailOrUsername: string,
  ): Promise<Account | null> {
    const isEmail = emailOrUsername.includes('@');
    const where = isEmail
      ? { providerEmail: emailOrUsername }
      : { providerUsername: emailOrUsername };

    return await this.findOne({
      where: { provider, ...where },
      relations: ['user'],
    });
  }

  async findOneByProviderUsername(username: string): Promise<Account | null> {
    return await this.findOne({
      where: { providerUsername: username },
      relations: ['user'],
    });
  }

  async findOneByProviderEmail(email: string): Promise<Account | null> {
    return await this.findOne({
      where: { providerEmail: email },
      relations: ['user'],
    });
  }

  async findOneByProviderProviderAccountId(
    username: string,
  ): Promise<Account | null> {
    return await this.findOne({
      where: { providerUsername: username },
      relations: ['user'],
    });
  }

  async updateOne(account: Account, data: Partial<Account>): Promise<Account> {
    const merge = this.merge(account, data);
    return await this.save(merge);
  }
}
