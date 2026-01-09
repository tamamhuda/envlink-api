import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Worker } from 'bullmq';
import { SEND_MAIL_RESET_PASSWORD_QUEUE } from 'src/queue/queue.constans';
import LoggerService from 'src/common/logger/logger.service';
import { MailResetPasswordService } from './mail-reset-password.service';
import { SendMailResetPasswordJob } from 'src/queue/interfaces/mail-reset-password.interface';

@Processor(SEND_MAIL_RESET_PASSWORD_QUEUE, {
  concurrency: 5,
})
export class MailResetPasswordProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailResetPasswordService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  /** ────────────────────────────────
   *  Main Processor
   *  ────────────────────────────────
   */
  async process(job: Job<SendMailResetPasswordJob>): Promise<string> {
    const { email, firstName, resetPasswordLink, ttlMinutes } = job.data;
    await this.mailService.send(
      email,
      firstName,
      resetPasswordLink,
      ttlMinutes,
    );
    return `Mail sent successfully to ${email} at ${new Date().toISOString()}`;
  }

  /** ────────────────────────────────
   *  Logging
   *  ────────────────────────────────
   */
  @OnWorkerEvent('active')
  onStart(job: Job<SendMailResetPasswordJob>) {
    this.logger.jobActive(job);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendMailResetPasswordJob>) {
    this.logger.jobFailed(job);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendMailResetPasswordJob>) {
    this.logger.jobCompleted(job);
  }
}
