import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { GoogleOauthStrategy } from './strategies/google-oauth.strategy';
import { SessionModule } from 'src/session/session.module';
import { AccountModule } from 'src/account/account.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [SessionModule, AccountModule, UserModule],
  controllers: [OauthController],
  providers: [OauthService, GoogleOauthStrategy],
})
export class OauthModule {}
