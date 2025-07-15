import {
  Controller,
  Get, Put,
  UseInterceptors
} from '@nestjs/common';
import { AppService } from './app.service';
import LoggerService from "./common/logger/logger.service";
import {IHealthz} from "./common/interfaces/healthz.interface";
import {Cached} from "./common/decorators/cached.decorator";
import {CacheInterceptor} from "./common/interceptors/cache.interceptor";
import {CachePrefix} from "./common/enums/cache-prefix.enum";

@Controller()
export class AppController {
  constructor(
      private readonly appService: AppService,
      private readonly logger: LoggerService,
  ) {
  }

  @Cached(CachePrefix.APP, 'healthz')
  @Get("/healthz")
  async healthz(): Promise<IHealthz> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // throw new BadRequestException('Healthz Exception');
    return await this.appService.healthz();
  }

  @Put("/healthz")
  async updateHealthz(): Promise<IHealthz> {
    return await this.appService.updateHealthz();
  }
}
