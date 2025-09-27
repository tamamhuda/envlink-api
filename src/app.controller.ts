import { Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { IHealthz } from './common/interfaces/healthz.interface';
import { Cached } from './common/decorators/cached.decorator';
import { CachePrefix } from './common/enums/cache-prefix.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Cached(CachePrefix.APP, 'healthz')
  @Get('/healthz')
  async healthz(): Promise<IHealthz> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // throw new BadRequestException('Healthz Exception');
    return await this.appService.healthz();
  }
}
