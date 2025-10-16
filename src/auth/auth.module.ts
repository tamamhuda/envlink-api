import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AccountModule } from 'src/account/account.module';
import { UserService } from 'src/user/user.service';
import { AccountService } from 'src/account/account.service';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionService } from 'src/session/session.service';
import { SessionModule } from 'src/session/session.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),

    UserModule,
    AccountModule,
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AccountService,
    SessionService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
