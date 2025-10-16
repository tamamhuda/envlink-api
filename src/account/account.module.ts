import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [SessionModule, UserModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
