import { DynamicModule, Module } from '@nestjs/common';
import { TurnstileGuard } from './guards/turnstile.guard';
import { BcryptService } from './services/bcrypt.service';
import { JwtService } from './services/jwt.service';
import { TokenService } from './services/token.service';
import { RedirectTokenService } from './services/redirect-token.service';
import { TurnstileService } from './services/turnstile.service';

@Module({
  providers: [
    TurnstileGuard,
    TurnstileService,
    BcryptService,
    JwtService,
    TokenService,
    RedirectTokenService,
  ],

  exports: [
    TurnstileGuard,
    TurnstileService,
    BcryptService,
    JwtService,
    TokenService,
    RedirectTokenService,
  ],
})
export class SecurityModule {
  static forRoot(): DynamicModule {
    return {
      module: SecurityModule,
      global: true,
    };
  }
}
