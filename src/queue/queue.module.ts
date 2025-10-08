import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRedisConfig } from 'src/config/cache.config';
import { SEND_MAIL_VERIFY_QUEUE } from './queue.constans';
import { MailUtil } from 'src/common/utils/mail.util';
import { MailProcessor } from './workers/mail/mail.processor';
import { MailService } from './workers/mail/mail.service';

@Global()
@Module({
  imports: [
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
  ],
  providers: [MailProcessor, MailService, MailUtil],
  exports: [BullModule],
})
export class QueueModule {}
