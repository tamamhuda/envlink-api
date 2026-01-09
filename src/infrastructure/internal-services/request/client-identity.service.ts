import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';
import {
  ClientInfo,
  IdentityHashes,
} from '../../../common/interfaces/client-identity.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientIdentityService {
  // Parse User-Agent string into browser, OS, and device type.
  parseUserAgent(userAgent: string): ClientInfo {
    const parse = new UAParser(userAgent);

    const { browser, os, device, ...rest } = parse.getResult();

    const deviceType = this.detectDeviceType(os.name, device.type);

    return {
      browser: browser.name ?? 'unknown',
      os: os.name ?? 'unknown',
      deviceType,
    };
  }

  detectDeviceType(osName?: string, deviceType?: string) {
    if (deviceType) return deviceType;

    const name = (osName ?? '').toLowerCase();

    if (name.includes('windows')) return 'desktop';
    if (name.includes('mac')) return 'desktop';
    if (name.includes('linux')) return 'desktop';

    return 'unknown';
  }

  // Generate a stable identity hash and a dynamic visit hash.
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

  // Detect device type based on OS name and device type.
}
