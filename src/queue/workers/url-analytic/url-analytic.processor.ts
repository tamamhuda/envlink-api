import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { URL_ANALYTIC_QUEUE } from 'src/queue/queue.constans';
import { AnalyticDto, CreateAnalyticDto } from 'src/urls/dto/analytic.dto';
import { UrlAnalyticService } from './url-analytic.service';
import { UrlAnalyticJob } from 'src/queue/interfaces/url-analytic-job.interface';
import { UrlsService } from 'src/urls/urls.service';
import { IpUtil } from 'src/common/utils/ip.util';
import LoggerService from 'src/logger/logger.service';
import { UAParser } from 'ua-parser-js';
import { CacheService } from 'src/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import ms from 'ms';
import { createHash } from 'crypto';

@Processor(URL_ANALYTIC_QUEUE, {
  concurrency: 10,
})
export class UrlAnalyticProcessor extends WorkerHost {
  constructor(
    private readonly ipUtil: IpUtil,
    private readonly urlService: UrlsService,
    private readonly analyticsService: UrlAnalyticService,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {
    super();
  }

  private validateIsHuman(
    os: string,
    browser: string,
    deviceType: string,
  ): boolean {
    function isValidIdentityPart(value: string): boolean {
      return (
        typeof value === 'string' &&
        value.trim() !== '' &&
        value.toLowerCase() !== 'unknown'
      );
    }

    return (
      isValidIdentityPart(os) &&
      isValidIdentityPart(browser) &&
      isValidIdentityPart(deviceType)
    );
  }

  async parseIdentityVisitor(
    urlCode: string,
    ipAddress: string,
    os: string,
    browser: string,
    deviceType: string,
  ): Promise<{ identityHash: string | null; isUnique: boolean }> {
    let identityHash: string | null = null;
    const isHuman = this.validateIsHuman(os, browser, deviceType);

    if (!isHuman) {
      return { identityHash: null, isUnique: false };
    }

    identityHash = createHash('sha256')
      .update(`${urlCode}:${ipAddress}:${os}:${browser}:${deviceType}`)
      .digest('hex');

    const uniqueExist =
      await this.analyticsService.findAnalyticByIdentityHash(identityHash);

    if (uniqueExist) {
      identityHash = createHash('sha256')
        .update(`${urlCode}:${ipAddress}:${browser}:${os}:${deviceType}`)
        .digest('hex');

      const cachedVisitor = await this.cache.getCache<string>(
        CachePrefix.URL_ANALYTICS,
        `visitor:${identityHash}`,
      );

      const nonUniqueExist = cachedVisitor
        ? null
        : await this.analyticsService.findAnalyticByIdentityHash(identityHash);

      if (cachedVisitor) identityHash = null;

      if (nonUniqueExist) {
        await this.analyticsService.incrementVisitorCount(nonUniqueExist);
        const ttl = ms('24h');
        await this.cache.set(
          CachePrefix.URL_ANALYTICS,
          `visitor:${nonUniqueExist.identityHash}`,
          identityHash,
          ttl,
        );
        identityHash = null;
      }
    }

    return {
      identityHash,
      isUnique: !uniqueExist,
    };
  }

  private parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    deviceType: string;
  } {
    const parser = new UAParser(userAgent);
    const { browser, os, device } = parser.getResult();
    const deviceType =
      device.type ||
      (/Windows|Mac\s?OS|Linux/i.test(os.name ?? '') ? 'desktop' : 'unknown');
    return {
      browser: browser.name || 'unknown',
      os: os.name || 'unknown',
      deviceType,
    };
  }

  async process(job: Job<UrlAnalyticJob>): Promise<AnalyticDto | null> {
    try {
      const { ipAddress, userAgent, referrer, urlCode } = job.data;
      const url = await this.urlService.findUrlByIdOrCode(undefined, urlCode);
      const { browser, os, deviceType } = this.parseUserAgent(userAgent);
      const { identityHash, isUnique } = await this.parseIdentityVisitor(
        url.code,
        ipAddress,
        browser,
        os,
        deviceType,
      );

      if (identityHash) {
        const { city, region, country, language } =
          await this.ipUtil.getIpLocation(ipAddress);

        const createAnalytic: CreateAnalyticDto = {
          identityHash,
          ipAddress,
          userAgent,
          referrer,
          deviceType,
          os,
          browser,
          city,
          region,
          country,
          language,
          isUnique,
        };
        const analytic = await this.analyticsService.recordVisit(
          createAnalytic,
          url,
        );

        if (analytic && !isUnique) {
          const ttl = ms('24h');
          await this.cache.set(
            CachePrefix.URL_ANALYTICS,
            `visitor:${identityHash}`,
            identityHash,
            ttl,
          );
        }
        return analytic;
      }
      this.logger.warn(`[SKIPPED] Visitor already counted`);
      return null;
    } catch (error) {
      this.logger.error(`[SKIPPED] Failed to process job ${job.id}: ${error}`);
      return null;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<UrlAnalyticJob>) {
    this.logger.log(`Job completed for URL: ${job.data.urlCode}`);
  }
}
