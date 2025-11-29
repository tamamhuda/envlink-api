import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Env } from 'src/config/env.config';
import ip2Location, {
  IPGeolocation,
  IpGeolocationResponse,
} from 'ip2location-io-nodejs';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from '../enums/cache-prefix.enum';
import ms from 'ms';

@Injectable()
export class IpUtil {
  private readonly ip2Client: IPGeolocation;

  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService<Env>,
    private readonly cache: CacheService,
  ) {
    const apiKey = this.config.getOrThrow('IP2_API_KEY');
    const ip2Config = new ip2Location.Configuration(apiKey);
    this.ip2Client = new ip2Location.IPGeolocation(ip2Config);
  }

  async getIpGeolocation(
    ipAddr: string,
  ): Promise<IpGeolocationResponse | undefined> {
    try {
      if (ipAddr === '127.0.0.1') return undefined;

      const cached = await this.cache.getCache<IpGeolocationResponse>(
        CachePrefix.IP_GEOLOCATION,
        ipAddr,
      );

      if (cached) return cached;

      const result = await this.ip2Client
        .lookup(ipAddr)
        .catch((error) => {
          this.logger.error(error);
          return undefined;
        })
        .then(async (data) => {
          const ttl = ms('1d');
          await this.cache.set(CachePrefix.IP_GEOLOCATION, ipAddr, data, ttl);
          return data;
        });

      return result;
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to fetch IP location');
    }
  }

  async getIpLocation(ip: string): Promise<{
    city: string;
    country: string;
    countryCode: string;
    region: string;
    language: string;
  }> {
    const location = await this.getIpGeolocation(ip);

    return {
      city: location?.city_name || 'Unknown',
      country: location?.country_name || 'Unknown',
      countryCode: location?.country_code || 'Unknown',
      region: location?.region_name || 'Unknown',
      language: location?.country?.language.code || 'Unknown',
    };
  }

  async getFormattedLocation(req: Request): Promise<string> {
    try {
      const ipAddr = this.getClientIp(req);

      // Skip lookup for localhost or missing IP
      if (!ipAddr || ipAddr === '127.0.0.1') {
        return 'Localhost';
      }

      const { city, region, countryCode, country } =
        await this.getIpLocation(ipAddr);

      // If all values are 'Unknown', return a fallback
      const isAllUnknown = [city, region, countryCode].every(
        (val) => !val || val === 'Unknown',
      );
      if (isAllUnknown) return 'Unknown location';

      // If only country is known
      if (
        (!city || city === 'Unknown') &&
        (!region || region === 'Unknown') &&
        country &&
        country !== 'Unknown'
      ) {
        return `Somewhere in ${country}`;
      }

      // Filter out 'Unknown' values before joining
      const parts = [city, region, country].filter(
        (val) => val && val !== 'Unknown',
      );

      return parts.length ? parts.join(', ') : 'Unknown location';
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
