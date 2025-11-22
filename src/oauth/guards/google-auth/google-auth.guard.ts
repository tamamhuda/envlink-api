import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { getGoogleOauthConfig } from 'src/config/google-oauth.config';
import { URLSearchParams } from 'url';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly googleConfig: ReturnType<typeof getGoogleOauthConfig>;
  constructor(config: ConfigService) {
    super();
    this.googleConfig = getGoogleOauthConfig(config);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const direct = Boolean(
      !request.query.direct || request.query.direct === 'true',
    );
    console.log('direct', direct);

    if (!direct) {
      request['oauthUrl'] = this.getGoogleAuthUrl(request);
      return true;
    }
    return super.canActivate(context);
  }

  private getGoogleAuthUrl(req: Request): string {
    const direct = req.query.direct;
    const redirect = req.query.redirect;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.googleConfig.clientID,
      redirect_uri: this.googleConfig.callbackURL,
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'select_account',
      scope: this.googleConfig.scope.join(' '),
    });

    let state: string | undefined;
    if (redirect || direct) {
      state = Buffer.from(JSON.stringify({ redirect, direct })).toString(
        'base64',
      );
    }

    // Optional: use ?state=xxx from client
    if (state) {
      params.set('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
