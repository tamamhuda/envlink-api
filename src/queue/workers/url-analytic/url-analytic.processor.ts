import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { URL_ANALYTIC_QUEUE } from 'src/queue/queue.constans';
import { AnalyticDto, CreateAnalyticDto } from 'src/urls/dto/analytic.dto';
import { UrlAnalyticService } from './url-analytic.service';
import { UrlAnalyticJob } from 'src/queue/interfaces/url-analytic.interface';
import { UrlsService } from 'src/urls/urls.service';
import { IpUtil } from 'src/common/utils/ip.util';
import LoggerService from 'src/common/logger/logger.service';
import { CacheService } from 'src/common/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import ms from 'ms';
import { Url } from 'src/database/entities/url.entity';
import { Channel } from 'src/database/entities/channel.entity';
import { ClientIdentityUtil } from 'src/common/utils/client-identity.util';

@Processor(URL_ANALYTIC_QUEUE, { concurrency: 10 })
export class UrlAnalyticProcessor extends WorkerHost {
  constructor(
    private readonly clientIdentityUtil: ClientIdentityUtil,
    private readonly ipUtil: IpUtil,
    private readonly urlService: UrlsService,
    private readonly analyticsService: UrlAnalyticService,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {
    super();
  }

  private async cacheAnalytic(identityHash: string, analytic: AnalyticDto) {
    await this.cache.set(
      CachePrefix.URL_ANALYTICS,
      `visitor:${identityHash}`,
      analytic,
      ms('24h'),
    );
  }

  private async getCachedAnalytic(identityHash: string) {
    return this.cache.getCache<AnalyticDto>(
      CachePrefix.URL_ANALYTICS,
      `visitor:${identityHash}`,
    );
  }

  /** ────────────────────────────────
   *  Analytics Creation Logic
   *  ────────────────────────────────
   */
  private async createAnalyticRecord(
    identityHash: string,
    ipAddress: string,
    userAgent: string,
    referrer: string,
    url: Url,
    os: string,
    browser: string,
    deviceType: string,
    isUnique: boolean,
    channels: Channel[] = [],
  ): Promise<AnalyticDto> {
    const { city, region, country, language } =
      await this.ipUtil.getIpLocation(ipAddress);

    const dto: CreateAnalyticDto = {
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

    return await this.analyticsService.recordVisit(dto, url, channels);
  }

  /** ────────────────────────────────
   *  Main Processor
   *  ────────────────────────────────
   */
  async process(job: Job<UrlAnalyticJob>): Promise<AnalyticDto> {
    const { ipAddress, userAgent, referrer, urlCode } = job.data;

    try {
      const url = await this.urlService.findUrlByIdOrCode(undefined, urlCode);
      const { browser, os, deviceType } =
        this.clientIdentityUtil.parseUserAgent(userAgent);
      const { identityHash, visitHash } =
        this.clientIdentityUtil.generateHashes(url.code, ipAddress, {
          os,
          browser,
          deviceType,
        });

      // Get cached analytic (24h)
      const cached = await this.getCachedAnalytic(visitHash);

      // Case First-time visit
      const existing =
        await this.analyticsService.findAnalyticByIdentityHash(identityHash);

      if (!existing) {
        return await this.createAnalyticRecord(
          identityHash,
          ipAddress,
          userAgent,
          referrer,
          url,
          os,
          browser,
          deviceType,
          true, // isUnique
          url.channels,
        );
      }

      // Case Revisit after identity  — same visitor, TTL expired
      if (!cached) {
        const existing =
          await this.analyticsService.findAnalyticByIdentityHash(visitHash);

        // if visit Hash not exist create new record visit
        if (!existing) {
          return await this.createAnalyticRecord(
            visitHash, // new hash for this session
            ipAddress,
            userAgent,
            referrer,
            url,
            os,
            browser,
            deviceType,
            false, // non-unique
            url.channels,
          ).then(async (record) => {
            await this.cacheAnalytic(visitHash, record);
            return record;
          });
        }
        await this.analyticsService.incrementVisitorCount(existing);
        return existing;
      }

      // Within TTL and same hash → no new record
      return cached;
    } catch (error) {
      throw new Error(error);
    }
  }

  /** ────────────────────────────────
   *  Logging
   *  ────────────────────────────────
   */
  @OnWorkerEvent('active')
  onStart(job: Job<UrlAnalyticJob, AnalyticDto>) {
    this.logger.jobActive(job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<UrlAnalyticJob, AnalyticDto>) {
    this.logger.jobFailed(job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<UrlAnalyticJob, AnalyticDto>) {
    this.logger.jobCompleted(job);
  }
}
