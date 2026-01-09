import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { URL_ANALYTIC_QUEUE } from 'src/queue/queue.constants';
import { AnalyticDto } from 'src/urls/dto/analytic.dto';
import { UrlAnalyticService } from './url-analytic.service';
import { UrlAnalyticJob } from 'src/queue/interfaces/url-analytic.interface';
import { UrlsService } from 'src/urls/urls.service';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { CacheService } from 'src/infrastructure/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import ms from 'ms';
import { Url } from 'src/database/entities/url.entity';
import { Channel } from 'src/database/entities/channel.entity';
import { Analytic } from 'src/database/entities/analytic.entity';
import { AnalyticType } from 'src/common/enums/analytic-type.enum';
import { IpService } from 'src/infrastructure/internal-services/request/ip.service';
import { ClientIdentityService } from 'src/infrastructure/internal-services/request/client-identity.service';

@Processor(URL_ANALYTIC_QUEUE, { concurrency: 10 })
export class UrlAnalyticProcessor extends WorkerHost {
  constructor(
    private readonly clientIdentityService: ClientIdentityService,
    private readonly ipService: IpService,
    private readonly urlService: UrlsService,
    private readonly analyticsService: UrlAnalyticService,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {
    super();
  }

  private async cacheAnalytic(identityHash: string, analytic: Analytic) {
    await this.cache.set(
      CachePrefix.URL_ANALYTICS,
      `visitor:${identityHash}`,
      analytic,
      ms('24h'),
    );
  }

  private async getCachedAnalytic(identityHash: string) {
    return this.cache.getCache<Analytic>(
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
    referrer: string | undefined,
    url: Url,
    os: string,
    browser: string,
    deviceType: string,
    isUnique: boolean,
    channels: Channel[] = [],
    type: AnalyticType,
  ): Promise<Analytic> {
    const {
      city,
      region,
      countryCode: country,
      language,
    } = await this.ipService.getIpLocation(ipAddress);

    const dto: Partial<Analytic> = {
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
      type,
    };

    const analytic = await this.analyticsService.recordVisit(
      dto,
      url,
      channels,
    );
    await this.analyticsService.incrementVisitorCount(analytic);

    return analytic;
  }

  /** ────────────────────────────────
   *  Main Processor
   *  ────────────────────────────────
   */
  async process(job: Job<UrlAnalyticJob>): Promise<Analytic> {
    const { ipAddress, userAgent, referrer, slug, type } = job.data;

    try {
      const url = await this.urlService.getUrlBySlug(slug);
      const { browser, os, deviceType } =
        this.clientIdentityService.parseUserAgent(userAgent);

      const { identityHash, visitHash } =
        this.clientIdentityService.generateHashes(url.code, ipAddress, {
          os,
          browser,
          deviceType,
        });

      // 1. Check unique visitor
      const existingIdentity =
        await this.analyticsService.findAnalyticByIdentityHash(identityHash);

      if (!existingIdentity && type === AnalyticType.CLICK) {
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
          type,
        );
      }

      // 2. Revisit logic (TTL-based, always new record)
      const cached = await this.getCachedAnalytic(visitHash);

      if (!cached) {
        const record = await this.createAnalyticRecord(
          visitHash,
          ipAddress,
          userAgent,
          referrer,
          url,
          os,
          browser,
          deviceType,
          false, // non-unique visit
          url.channels,
          type,
        );

        await this.cacheAnalytic(visitHash, record);
        return record;
      }

      // 3. Same session within TTL → no new record
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
