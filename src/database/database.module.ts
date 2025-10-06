import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AccountRepository } from './repositories/account.repository';
import { SessionRepository } from './repositories/session.repository';

@Global()
@Module({
  providers: [UserRepository, AccountRepository, SessionRepository],
  exports: [UserRepository, AccountRepository, SessionRepository],
})
export class DatabaseModule {}
