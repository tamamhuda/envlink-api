import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Env } from 'src/config/env.config';
import { getGoogleOauthConfig } from 'src/config/google-oauth.config';
import { GoogleProfile } from '../../common/interfaces/google-profile.interface';

@Injectable()
export class GoogleClientService {
  private client: OAuth2Client;
  private config: ReturnType<typeof getGoogleOauthConfig>;

  constructor(config: ConfigService<Env>) {
    this.config = getGoogleOauthConfig(config);
    this.client = new OAuth2Client({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.callbackUri,
    });
  }

  generateAuthUrl(state?: string) {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: this.config.scope,
      response_type: 'code',
      include_granted_scopes: true,
      state,
    });
  }

  async verifyCredential(credential: string): Promise<GoogleProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: this.config.clientId,
    });

    const payload = ticket.getPayload();
    const {
      sub: id,
      email,
      name,
      picture,
      email_verified: emailVerified,
    } = payload || {};

    if (!payload || !emailVerified || !email || !id) {
      throw new UnauthorizedException('Invalid Authorization');
    }

    return {
      id,
      fullName: name ?? '',
      email,
      picture,
      emailVerified,
    };
  }
}
