import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  UrlMetadata,
  UrlMetadataJob,
} from 'src/queue/interfaces/url-metadata.interface';
import { URL_METADATA_QUEUE } from 'src/queue/queue.constants';
import UrlMetadataService from './url-metadata.service';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { UrlsService } from 'src/urls/urls.service';
import { CacheService } from 'src/infrastructure/cache/cache.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import ms from 'ms';

@Processor(URL_METADATA_QUEUE, {
  concurrency: 4,
})
export class UrlMetadataProcessor extends WorkerHost {
  constructor(
    private readonly urlMetadataService: UrlMetadataService,
    private readonly logger: LoggerService,
    private readonly urlService: UrlsService,
    private readonly cache: CacheService,
  ) {
    super();
  }

  private async fetchMetadata(url: string): Promise<UrlMetadata> {
    const cached = await this.cache.getCache<UrlMetadata>(
      CachePrefix.URL_METADATA,
      url,
    );
    if (cached) return cached;

    const metadata = await this.urlMetadataService.fetchMetadata(url);
    const ttl = ms('7d');
    await this.cache.set(CachePrefix.URL_METADATA, url, metadata, ttl);
    return metadata;
  }

  async process(job: Job<UrlMetadataJob>): Promise<UrlMetadata> {
    try {
      const { urlId } = job.data;
      const url = await this.urlService.findUrlByIdOrCode(urlId);
      const metadata = await this.fetchMetadata(url.originalUrl);
      await this.urlService.updateUrl(url.id, {
        metadata,
      });
      return metadata;
    } catch (error) {
      throw new Error(error);
    }
  }

  @OnWorkerEvent('active')
  onStart(job: Job<UrlMetadataJob, UrlMetadata>) {
    this.logger.jobActive(job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<UrlMetadataJob, UrlMetadata>) {
    this.logger.jobFailed(job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<UrlMetadataJob, UrlMetadata>) {
    this.logger.jobCompleted(job);
  }
}
