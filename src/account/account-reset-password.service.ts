import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SEND_MAIL_RESET_PASSWORD_QUEUE } from 'src/queue/queue.constans';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TokenUtil } from 'src/common/utils/token.util';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { AccountRepository } from 'src/database/repositories/account.repository';
import { Account } from 'src/database/entities/account.entity';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { SendMailResetPasswordJob } from 'src/queue/interfaces/mail-reset-password.interface';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { Url } from 'src/database/entities/url.entity';
import { User } from 'src/database/entities/user.entity';
import ms, { StringValue } from 'ms';

@Injectable()
export class AccountResetPasswordService {
  private readonly BASE_URL: string;
  constructor(
    private readonly accountRepository: AccountRepository,
    @InjectQueue(SEND_MAIL_RESET_PASSWORD_QUEUE)
    private readonly mailResetQueue: Queue<SendMailResetPasswordJob>,
    private readonly tokenUtil: TokenUtil,
    private readonly cache: CacheService,
    private readonly configService: ConfigService<Env>,
    private readonly bcryptUtil: BcryptUtil,
  ) {
    const APP_URL = this.configService.getOrThrow('APP_URL');
    const API_PREFIX = this.configService.getOrThrow('API_PREFIX');
    this.BASE_URL = `${APP_URL}/${API_PREFIX}`;
  }

  async send(email: string, resetPasswordUrl: string): Promise<void> {
    const user = await this.accountRepository.manager
      .getRepository(User)
      .findOneBy({ email });
    if (!user) return;

    const TTL_MINUTES = 15;
    const exp = Math.floor(Date.now() / 1000) + TTL_MINUTES * 60;
    const token = this.tokenUtil.create(user.id, email, TTL_MINUTES);

    let resetPasswordLink = resetPasswordUrl.endsWith('/')
      ? resetPasswordUrl
      : `${resetPasswordUrl}/`;

    resetPasswordLink += `?token=${token}&exp=${exp}`;

    await this.mailResetQueue.add('EmailResetPassword', {
      email,
      firstName: user.fullName.split(' ')[0],
      resetPasswordLink,
      ttlMinutes: TTL_MINUTES,
    });
  }

  async findAccountsByEmail(providerEmail: string): Promise<Account[]> {
    const accounts = await this.accountRepository.findBy({ providerEmail });
    if (accounts.length === 0) throw new NotFoundException('Account not found');
    return accounts;
  }

  async resetPassword(token: string, password: string): Promise<Account[]> {
    const payload = this.tokenUtil.verify(token);

    if (!payload) throw new ForbiddenException();
    const { email, sub, isExpired, exp } = payload;
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (isExpired || ttl <= 0) throw new ForbiddenException('Token expired');

    const used = await this.cache.getCache<boolean>(
      CachePrefix.TOKENS,
      `BLACKLIST:${token}`,
    );

    if (used) throw new ForbiddenException('Token already used');

    const accounts = await this.findAccountsByEmail(email);
    await this.accountRepository.updateMany(accounts, {
      passwordHash: await this.bcryptUtil.hashPassword(password),
    });

    await this.cache.set(
      CachePrefix.TOKENS,
      `BLACKLIST:${token}`,
      true,
      ms(`${ttl}s` as StringValue),
    );

    await this.cache.invalidate([
      {
        prefix: CachePrefix.USER,
        key: sub,
      },
      {
        prefix: CachePrefix.SESSION,
        key: `${sub}:*`,
      },
    ]);
    return accounts;
  }
}
