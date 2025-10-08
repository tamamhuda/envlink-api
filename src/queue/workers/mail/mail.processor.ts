import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Worker } from 'bullmq';
import { SEND_MAIL_VERIFY_QUEUE } from 'src/queue/queue.constans';
import { MailService } from './mail.service';
import { SendMailVerifyType } from './mail.dto';

@Processor(SEND_MAIL_VERIFY_QUEUE, {
  concurrency: 5,
})
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendMailVerifyType>): Promise<string> {
    const { email, firstName, verifyLink } = job.data;
    await this.mailService.sendVerifyEmail(email, firstName, verifyLink);
    return 'Mail sent successfully';
  }
}
