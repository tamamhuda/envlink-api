import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { SEND_MAIL_VERIFY_QUEUE } from 'src/queue/queue.constans';
import { InjectQueue } from '@nestjs/bullmq';
import { SendMailVerifyJob } from 'src/queue/interfaces/mail-verify.interface';
import { Queue } from 'bullmq';
import { TokenUtil } from 'src/common/utils/token.util';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { AccountRepository } from 'src/database/repositories/account.repository';
import { ProviderEnum } from 'src/common/enums/provider.enum';
import { Account } from 'src/database/entities/account.entity';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';

@Injectable()
export class AccountVerifyService {
  private readonly BASE_URL: string;
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly urlGenService: UrlGeneratorService,
    @InjectQueue(SEND_MAIL_VERIFY_QUEUE)
    private readonly mailVerifyQueue: Queue<SendMailVerifyJob>,
    private readonly tokenUtil: TokenUtil,
    private readonly cache: CacheService,
    private readonly configService: ConfigService<Env>,
  ) {
    const APP_URL = this.configService.getOrThrow('APP_URL');
    const API_PREFIX = this.configService.getOrThrow('API_PREFIX');
    this.BASE_URL = `${APP_URL}/${API_PREFIX}`;
  }

  async send(
    id: string,
    email: string,
    name: string,
    clientUrl?: string,
  ): Promise<void> {
    const TTL_MINUTE = 5;
    const token = this.tokenUtil.create(id, email, TTL_MINUTE);

    let verifyLink = this.urlGenService.generateUrlFromPath({
      relativePath: 'auth/verify',
      query: {
        token,
      },
    });

    console.log(clientUrl);

    if (clientUrl) {
      verifyLink = verifyLink.replace(this.BASE_URL, clientUrl);
    }

    await this.mailVerifyQueue.add('EmailVerification', {
      email,
      firstName: name.split(' ')[0],
      verifyLink,
    });
  }

  async resend(providerAccountId: string, clientUrl?: string): Promise<string> {
    const account =
      await this.accountRepository.findOneByProviderAccountId(
        providerAccountId,
      );

    if (!account) throw new NotFoundException('Account not found');

    const {
      isVerified,
      user: { id, email, fullName },
    } = account;

    if (isVerified) throw new ConflictException('Account already verified');

    await this.send(id, email, fullName, clientUrl);

    return 'OK';
  }

  async verifyLocalAccountByProviderEmail(email: string): Promise<Account> {
    const account =
      await this.accountRepository.findOneByProviderAndProviderEmail(
        ProviderEnum.LOCAL,
        email,
      );
    if (!account) throw new NotFoundException('Account not found');
    if (account.isVerified)
      throw new ConflictException('Account already verified');

    return await this.accountRepository.updateOne(account, {
      isVerified: true,
      verifiedAt: new Date(),
    });
  }

  async verify(token: string): Promise<Account> {
    const payload = this.tokenUtil.verify(token);
    if (!payload) throw new ForbiddenException('Invalid token');
    const { email, sub, isExpired } = payload;
    if (isExpired) throw new ForbiddenException('Token expired');

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

    return await this.verifyLocalAccountByProviderEmail(email);
  }
}
