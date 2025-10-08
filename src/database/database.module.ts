import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AccountRepository } from './repositories/account.repository';
import { SessionRepository } from './repositories/session.repository';
import { UrlRepository } from './repositories/url.repository';
import { AnalyticRepository } from './repositories/analytic.repository';
import { ChannelRepository } from './repositories/channel.repository';

@Global()
@Module({
  providers: [
    UserRepository,
    AccountRepository,
    SessionRepository,
    UrlRepository,
    AnalyticRepository,
    ChannelRepository,
  ],
  exports: [
    UserRepository,
    AccountRepository,
    SessionRepository,
    UrlRepository,
    AnalyticRepository,
    ChannelRepository,
  ],
})
export class DatabaseModule {}
