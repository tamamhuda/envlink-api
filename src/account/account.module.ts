import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { SessionModule } from 'src/sessions/session.module';
import { AccountVerifyService } from './account-verify.service';

@Module({
  imports: [SessionModule],
  controllers: [AccountController],
  providers: [AccountService, AccountVerifyService],
  exports: [AccountService, AccountVerifyService],
})
export class AccountModule {}
