import { Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { Cached } from './common/decorators/cached.decorator';
import { CachePrefix } from './common/enums/cache-prefix.enum';
import { HealthzDto } from './common/dto/healthz.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Cached(CachePrefix.APP, 'healthz')
  @Get('/healthz')
  @ZodSerializerDto(HealthzDto)
  @ApiOkResponse({
    type: HealthzDto,
    description: 'Health check response',
  })
  async healthz(): Promise<HealthzDto> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return await this.appService.healthz();
  }
}
