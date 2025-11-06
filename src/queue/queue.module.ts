import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRedisConfig } from 'src/config/cache.config';
import {
  SEND_MAIL_SUBSCRIPTION_QUEUE,
  SEND_MAIL_VERIFY_QUEUE,
  URL_ANALYTIC_QUEUE,
  URL_METADATA_QUEUE,
} from './queue.constans';
import { MailVerifyProcessor } from './workers/mail/mail-verify.processor';
import { MailVerifyService } from './workers/mail/mail-verify.service';
import { UrlsModule } from 'src/urls/urls.module';
import { UrlAnalyticProcessor } from './workers/url-analytic/url-analytic.processor';
import { UrlAnalyticService } from './workers/url-analytic/url-analytic.service';
import UrlMetadataService from './workers/url-metadata/url-metadata.service';
import { UrlMetadataProcessor } from './workers/url-metadata/url-metadata.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { MailSubscriptionService } from './workers/mail/mail-subscription.service';
import { MailSubscriptionProcessor } from './workers/mail/mail-subscription.processor';

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
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: {
              age: 60 * 60 * 24, // 24 hours
            },
            removeOnFail: {
              age: 60 * 60 * 24 * 7, // 7 days
            },
          },
        };
      },
    }),

    BullModule.registerQueue({ name: SEND_MAIL_VERIFY_QUEUE }),
    BullModule.registerQueue({ name: SEND_MAIL_SUBSCRIPTION_QUEUE }),
    BullModule.registerQueue({ name: URL_ANALYTIC_QUEUE }),
    BullModule.registerQueue({ name: URL_METADATA_QUEUE }),

    BullBoardModule.forFeature(
      {
        name: SEND_MAIL_VERIFY_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: SEND_MAIL_SUBSCRIPTION_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: URL_ANALYTIC_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: URL_METADATA_QUEUE,
        adapter: BullMQAdapter,
      },
    ),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
  ],
  providers: [
    MailVerifyProcessor,
    MailVerifyService,
    MailSubscriptionProcessor,
    MailSubscriptionService,
    UrlAnalyticService,
    UrlAnalyticProcessor,
    UrlMetadataProcessor,
    UrlMetadataService,
  ],
  exports: [BullModule],
})
export class QueueModule {}
