import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Worker } from 'bullmq';
import { SEND_MAIL_VERIFY_QUEUE } from 'src/queue/queue.constans';
import { MailService } from './mail.service';
import { SendMailVerifyJob } from 'src/queue/interfaces/mail-verify.interface';
import LoggerService from 'src/common/logger/logger.service';

@Processor(SEND_MAIL_VERIFY_QUEUE, {
  concurrency: 5,
})
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  /** ────────────────────────────────
   *  Main Processor
   *  ────────────────────────────────
   */
  async process(job: Job<SendMailVerifyJob>): Promise<string> {
    const { email, firstName, verifyLink } = job.data;
    await this.mailService.sendVerifyEmail(email, firstName, verifyLink);
    return `Mail sent successfully to ${email} at ${new Date().toISOString()}`;
  }

  /** ────────────────────────────────
   *  Logging
   *  ────────────────────────────────
   */
  @OnWorkerEvent('active')
  onStart(job: Job<SendMailVerifyJob>) {
    this.logger.jobActive(job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendMailVerifyJob>) {
    this.logger.jobFailed(job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendMailVerifyJob>) {
    this.logger.jobCompleted(job);
  }
}
