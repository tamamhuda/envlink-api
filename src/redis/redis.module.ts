import {Global, Module} from '@nestjs/common';
import { RedisService } from './redis.service';
import LoggerService from "../common/logger/logger.service";


@Global()
@Module({
  providers: [RedisService, LoggerService],
  exports: [RedisService]
})
export class RedisModule {}
