import { Global, Logger, Module } from '@nestjs/common';
import LoggerService from './logger.service';

@Global()
@Module({
  providers: [LoggerService, Logger],
  exports: [LoggerService, Logger],
})
export class LoggerModule {}
