import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { SessionModule } from 'src/sessions/session.module';
import { AccountVerifyService } from './account-verify.service';
import { AccountResetPasswordService } from './account-reset-password.service';

@Module({
  imports: [SessionModule],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountVerifyService,
    AccountResetPasswordService,
  ],
  exports: [AccountService, AccountVerifyService, AccountResetPasswordService],
})
export class AccountModule {}
