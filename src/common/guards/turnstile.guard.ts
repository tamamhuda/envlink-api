// turnstile.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TurnstileService } from '../services/turnstile.service';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';
import { Request } from 'express';
import { IpUtil } from '../utils/ip.util';
import camelcaseKeys from 'camelcase-keys';

@Injectable()
export class TurnstileGuard implements CanActivate {
  private readonly turnstileEnabled: boolean;

  constructor(
    private readonly turnstile: TurnstileService,
    private readonly config: ConfigService<Env>,
    private readonly ipUtil: IpUtil,
  ) {
    this.turnstileEnabled = config.getOrThrow('TURNSTILE_ENABLED');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.turnstileEnabled) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const clientIp = this.ipUtil.getClientIp(req);
    const token = camelcaseKeys(req.body).captchaToken;

    if (!token) {
      throw new BadRequestException('Captcha token required');
    }

    const isValid = await this.turnstile.verify(token, clientIp);

    if (!isValid) {
      throw new ForbiddenException('Invalid captcha');
    }

    return true;
  }
}
