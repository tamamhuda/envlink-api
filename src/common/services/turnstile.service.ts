import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.config';

@Injectable()
export class TurnstileService {
  private readonly secret: string;
  constructor(config: ConfigService<Env>) {
    this.secret = config.getOrThrow('TURNSTILE_SECRET_KEY');
  }

  async verify(token: string, ip?: string): Promise<boolean> {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: this.secret,
          response: token,
          remoteip: ip,
        }),
      },
    );

    const data = await res.json();
    return data?.success === true;
  }
}
