import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';
import {
  ClientInfo,
  IdentityHashes,
} from '../interfaces/client-identity.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientIdentityUtil {
  /**
   * Parse User-Agent string into browser, OS, and device type.
   */
  parseUserAgent(userAgent: string): ClientInfo {
    const { browser, os, device } = new UAParser(userAgent).getResult();

    const deviceType =
      device.type ||
      (/Windows|Mac\s?OS|Linux/i.test(os.name ?? '') ? 'desktop' : 'unknown');

    return {
      browser: browser.name ?? 'unknown',
      os: os.name ?? 'unknown',
      deviceType,
    };
  }

  /**
   * Generate a stable identity hash and a dynamic visit hash.
   *
   * @param urlCode - URL code or identifier
   * @param ip - Client IP address
   * @param clientInfo - Parsed client info from parseUserAgent
   */
  generateHashes(
    unique: string,
    ip: string,
    clientInfo: ClientInfo,
  ): IdentityHashes {
    const { os, browser, deviceType } = clientInfo;

    const identityHash = createHash('sha256')
      .update(`${unique}:${os}:${browser}:${deviceType}`)
      .digest('hex');

    const visitHash = createHash('sha256')
      .update(`${identityHash}:${ip}`)
      .digest('hex');

    return { identityHash, visitHash };
  }
}
