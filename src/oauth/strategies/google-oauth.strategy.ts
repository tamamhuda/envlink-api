import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Env } from 'src/config/env.config';
import { getGoogleOauthConfig } from 'src/config/google-oauth.config';
import { OauthService } from '../oauth.service';
import { StrategyFailure } from 'passport';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService<Env>,
    private readonly oauthService: OauthService,
  ) {
    const clientConfig = getGoogleOauthConfig(config);
    super({
      clientID: clientConfig.clientId,
      clientSecret: clientConfig.clientSecret,
      callbackURL: clientConfig.callbackUri,
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options: any) {
    const redirect = req.query.redirect;

    let state: string | undefined;
    if (redirect) {
      state = Buffer.from(JSON.stringify({ redirect })).toString('base64');
    }

    super.authenticate(req, {
      ...options,
      session: false,
      state,
    });
  }

  async validate(
    request: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    // Retrieve the 'state' parameter from the request object
    try {
      const stateEncoded = request.query.state as string;

      let state = {};
      if (stateEncoded) {
        const { redirect } = JSON.parse(
          Buffer.from(stateEncoded, 'base64').toString(),
        );
        state = {
          redirect,
        };
      }

      const authenticated = await this.oauthService.signInWithGoogle(
        profile,
        request,
      );

      request.state = {
        ...state,
        ...authenticated,
      };

      done(null, authenticated.user);
    } catch (error) {
      console.log('Error:');
      done(error);
    }
  }
}
