import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRedisConfig } from 'src/config/cache.config';
import { SEND_MAIL_VERIFY_QUEUE, URL_ANALYTIC_QUEUE } from './queue.constans';
import { MailUtil } from 'src/common/utils/mail.util';
import { MailProcessor } from './workers/mail/mail.processor';
import { MailService } from './workers/mail/mail.service';
import { AnalyticService } from './workers/analytic/analytic.service';
import { AnalyticProcessor } from './workers/analytic/analytic.processor';
import { UrlsModule } from 'src/urls/urls.module';

@Global()
@Module({
  imports: [
    UrlsModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          connection: getRedisConfig(config, 1),
          defaultJobOptions: {
            attempts: 3,
            removeOnComplete: 3000,
            removeOnFail: 3000,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: SEND_MAIL_VERIFY_QUEUE }),
    BullModule.registerQueue({ name: URL_ANALYTIC_QUEUE }),
  ],
  providers: [
    MailProcessor,
    MailService,
    MailUtil,
    AnalyticService,
    AnalyticProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
