import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { getGoogleOauthConfig } from 'src/config/google-oauth.config';
import { GoogleClientService } from 'src/infrastructure/integrations/google-client.service';
import { URLSearchParams } from 'url';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly googleConfig: ReturnType<typeof getGoogleOauthConfig>;
  constructor(
    config: ConfigService,
    private readonly client: GoogleClientService,
  ) {
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

    if (!direct) {
      request['oauthUrl'] = this.getGoogleAuthUrl(request);
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const res = context.switchToHttp().getResponse<Response>();

    // If headers already sent: do nothing
    if (res.headersSent) return res;

    return user; // Normal case
  }

  private getGoogleAuthUrl(req: Request): string {
    const direct = req.query.direct;
    const redirect = req.query.redirect;

    let state: string | undefined;
    if (redirect || direct) {
      state = Buffer.from(JSON.stringify({ redirect, direct })).toString(
        'base64',
      );
    }

    return this.client.generateAuthUrl(state);
  }
}
