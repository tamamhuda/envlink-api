import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Env } from 'src/config/env.config';

@Injectable()
export class TokenService {
  private readonly SECRET: string;

  constructor(private readonly config: ConfigService<Env>) {
    this.SECRET = this.config.getOrThrow('APP_SECRET');
  }

  create(sub: string, email: string, ttlMinutes = 15): string {
    const exp = Math.floor(Date.now() / 1000) + ttlMinutes * 60;
    const data = `${sub}:${email}:${exp}`;

    const sig = createHmac('sha256', this.SECRET)
      .update(data)
      .digest('base64url')
      .slice(0, 12); // shorten signature

    return Buffer.from(`${data}:${sig}`).toString('base64url');
  }

  verify(
    token: string,
  ): { sub: string; email: string; exp: number; isExpired: boolean } | null {
    try {
      let isExpired = false;
      const decoded = Buffer.from(token, 'base64url').toString();
      const [sub, email, expStr, sig] = decoded.split(':');
      const data = `${sub}:${email}:${expStr}`;
      const expected = createHmac('sha256', this.SECRET)
        .update(data)
        .digest('base64url')
        .slice(0, 12);

      if (sig !== expected) return null;
      const exp = parseInt(expStr, 10);
      if (Date.now() / 1000 > exp) isExpired = true;

      return { sub, email, exp, isExpired };
    } catch {
      return null;
    }
  }
}
