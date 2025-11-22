import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import ms from 'ms';
import { randomUUID } from 'node:crypto';
import { Profile } from 'passport-google-oauth20';
import { AccountService } from 'src/account/account.service';
import { AuthenticatedDto } from 'src/auth/dto/authenticated.dto';
import { TokensDto } from 'src/auth/dto/token.dto';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { Account } from 'src/database/entities/account.entity';
import { UserMapper } from 'src/user/mapper/user.mapper';

@Injectable()
export class OauthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly cache: CacheService,
    private readonly userMapper: UserMapper,
  ) {}

  private async mapToAuthenticatedDto(
    account: Account,
    tokens: TokensDto,
  ): Promise<AuthenticatedDto> {
    const user = await this.userMapper.mapToUserInfoDto(account, account.user);
    return {
      tokens: tokens,
      user: user,
    };
  }

  async signInWithGoogle(
    profile: Profile,
    req: Request,
  ): Promise<AuthenticatedDto> {
    const { account, tokens } =
      await this.accountService.findAccountByGoogleProviderWithTokens(
        profile.id,
        req,
      );

    if (account && tokens) {
      return await this.mapToAuthenticatedDto(account, tokens);
    }

    const result = await this.accountService.createAccountByGoogleWithTokens(
      profile,
      req,
    );

    return await this.mapToAuthenticatedDto(result.account, result.tokens);
  }

  async generateCode(auth: AuthenticatedDto) {
    const code = `${randomUUID()}-${new Date().getTime()}`;
    await this.cache.set(CachePrefix.TOKENS, code, auth, ms('1m'));
    return code;
  }

  async exchangeCode(code: string): Promise<AuthenticatedDto> {
    const auth = await this.cache.getCache<AuthenticatedDto>(
      CachePrefix.TOKENS,
      code,
    );
    console.log('oauth', code);
    if (!auth) throw new UnauthorizedException('Invalid or expired code');

    return auth;
  }
}
