import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  UrlMetadata,
  UrlMetadataJob,
} from 'src/queue/interfaces/url-metadata.interface';
import { URL_METADATA_QUEUE } from 'src/queue/queue.constans';
import UrlMetadataService from './url-metadata.service';
import LoggerService from 'src/logger/logger.service';
import { UrlsService } from 'src/urls/urls.service';

@Processor(URL_METADATA_QUEUE, {
  concurrency: 4,
})
export class UrlMetadataProcessor extends WorkerHost {
  constructor(
    private readonly urlMetadataService: UrlMetadataService,
    private readonly logger: LoggerService,
    private readonly urlService: UrlsService,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onStart(job: Job<UrlMetadataJob>) {
    this.logger.debug(`[${job.queueName}:${job.id}]: STARTED`);
  }

  async process(job: Job<UrlMetadataJob>): Promise<UrlMetadata> {
    try {
      const { urlId } = job.data;
      const url = await this.urlService.findUrlByIdOrCode(urlId);
      const metadata = await this.urlMetadataService.fetchMetadata(
        url.originalUrl,
      );
      await this.urlService.updateUrl(url.id, {
        metadata,
      });
      return metadata;
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error.message}`);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<UrlMetadataJob, UrlMetadata>): Promise<void> {
    const duration = Date.now() - job.timestamp;
    const data = job.returnvalue;
    const jobIsFail = await job.isFailed();
    this.logger.debug(
      `[${job.queueName}:${job.id}]: ${!jobIsFail ? 'COMPLETED' : 'FAILED'} - ${duration}ms : ${JSON.stringify(data, null, 2)}`,
    );
  }
}
