import { Logger } from '@nestjs/common';
import { Request } from 'express';
import ipapi from 'ipapi.co';
import { IpApiLocation } from 'ipapi.co';

export class IpUtil {
  private readonly logger: Logger = new Logger(IpUtil.name);

  async getIpLocation(ipAddr: string): Promise<IpApiLocation | undefined> {
    try {
      if (ipAddr === '127.0.0.1') return undefined;

      const result = await new Promise<IpApiLocation | undefined>((resolve) => {
        void ipapi.location((res: IpApiLocation) => {
          resolve(res);
        }, ipAddr);
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to fetch IP location');
    }
  }

  async getFormattedLocation(req: Request): Promise<string> {
    try {
      const ipAddr = this.getClientIp(req);

      // Skip lookup for localhost or missing IP
      if (!ipAddr || ipAddr === '127.0.0.1') {
        return 'Localhost';
      }

      const location = await this.getIpLocation(ipAddr);

      // Safely build readable string
      const parts =
        location &&
        [location.city, location.region, location.country_name].filter(Boolean);

      return parts && parts.length ? parts.join(', ') : 'Unknown location';
    } catch (error) {
      this.logger.error('Failed to fetch IP location', error);
      return 'Unknown location';
    }
  }

  getClientIp(req: Request): string {
    // X-Forwarded-For may contain multiple IPs (client, proxy1, proxy2)
    let ip = req.headers['x-forwarded-for'] as string | undefined;

    if (ip) {
      ip = ip.split(',')[0].trim();
    } else {
      ip = req.ip || req.socket.remoteAddress || '-';
    }

    // Normalize localhost / IPv4-mapped IPv6
    if (ip === '::1') ip = '127.0.0.1';
    else if (ip.startsWith('::ffff:')) ip = ip.substring(7);

    return ip;
  }
}
