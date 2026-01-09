import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Env } from 'src/config/env.config';
import { RedirectTokenPayload } from '../../common/interfaces/redirect-token-payload.interface';

@Injectable()
export class RedirectTokenService {
  private readonly SECRET: Buffer;

  constructor(private readonly config: ConfigService<Env>) {
    this.SECRET = Buffer.from(this.config.getOrThrow('APP_SECRET'));
  }

  create(payload: {
    slug: string;
    redirectUrl: string;
    ttlSeconds?: number;
  }): string {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (payload.ttlSeconds ?? 60); // default 60s

    const body = {
      slug: payload.slug,
      event: 'IMPRESSION' as const,
      redirectUrl: payload.redirectUrl,
      iat,
      exp,
    };

    const encoded = Buffer.from(JSON.stringify(body)).toString('base64url');

    const sig = createHmac('sha256', this.SECRET)
      .update(encoded)
      .digest('base64url')
      .slice(0, 16);

    return `${encoded}.${sig}`;
  }

  verify(token: string): {
    payload: RedirectTokenPayload;
    isExpired: boolean;
  } | null {
    try {
      const [encoded, sig] = token.split('.');
      if (!encoded || !sig) return null;

      const expectedSig = createHmac('sha256', this.SECRET)
        .update(encoded)
        .digest('base64url')
        .slice(0, 16);

      if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        return null;
      }

      const payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString(),
      ) as RedirectTokenPayload;

      const now = Math.floor(Date.now() / 1000);
      const isExpired = now > payload.exp;

      return { payload, isExpired };
    } catch {
      return null;
    }
  }
}
