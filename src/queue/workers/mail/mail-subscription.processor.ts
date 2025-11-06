import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import LoggerService from 'src/common/logger/logger.service';
import { SEND_MAIL_SUBSCRIPTION_QUEUE } from 'src/queue/queue.constans';
import { Job } from 'bullmq';
import { SendMailSubscriptionJob } from 'src/queue/interfaces/mail-subscription.interface';
import { MailSubscriptionService } from './mail-subscription.service';

@Processor(SEND_MAIL_SUBSCRIPTION_QUEUE, {
  concurrency: 5,
})
export class MailSubscriptionProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailSubscriptionService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  /** ────────────────────────────────
   *  Main Processor
   *  ────────────────────────────────
   */
  async process(job: Job<SendMailSubscriptionJob>): Promise<string> {
    const { subscriptionId, to, event } = job.data;
    await this.mailService.sendNotification(event, to, subscriptionId);
    return `Mail sent successfully to ${to.address} at ${new Date().toISOString()}`;
  }

  /** ────────────────────────────────
   *  Logging
   *  ────────────────────────────────
   */
  @OnWorkerEvent('active')
  onStart(job: Job<SendMailSubscriptionJob>) {
    this.logger.jobActive(job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendMailSubscriptionJob>) {
    this.logger.jobFailed(job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendMailSubscriptionJob>) {
    this.logger.jobCompleted(job);
  }
}
