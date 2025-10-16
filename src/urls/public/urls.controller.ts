import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UrlsService } from '../urls.service';
import LoggerService from 'src/common/logger/logger.service';
import { ShortenUrlDto } from '../dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { PublicUrlDto, PublicUrlResponse, UnlockUrlDto } from '../dto/url.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UrlAnalyticInterceptor } from 'src/common/interceptors/url-analytic.interceptor';
import { ForbiddenResponse } from 'src/common/dto/error-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

@Public()
@Controller('public/urls')
export class PublicUrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly logger: LoggerService,
  ) {}

  @Post('shorten')
  @ThrottleScope(PolicyScope.SHORTEN_PUBLIC)
  @ApiCreatedResponse({
    type: PublicUrlResponse,
    description: 'Created a new public short URL',
  })
  @ZodSerializerDto(PublicUrlDto)
  async shortenUrl(@Body() body: ShortenUrlDto): Promise<PublicUrlDto> {
    return await this.urlsService.createUrl(body);
  }

  @SkipThrottle()
  @Get(':code')
  @UseInterceptors(UrlAnalyticInterceptor)
  @ApiOkResponse({
    type: PublicUrlResponse,
    description: 'Get a short URL for a public access',
  })
  @ApiForbiddenResponse({
    type: ForbiddenResponse,
    description: 'Forbidden access to the URL',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PublicUrlDto)
  async getUrl(@Param('code') code: string): Promise<PublicUrlDto> {
    return await this.urlsService.getUrlByCode(code);
  }

  @SkipThrottle()
  @Post('unlock/:code')
  @ApiOkResponse({
    type: PublicUrlResponse,
    description: 'Unlock a short URL for a public access',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PublicUrlDto)
  async unlockUrl(
    @Param('code') code: string,
    @Body() body: UnlockUrlDto,
  ): Promise<PublicUrlDto> {
    return await this.urlsService.unlockUrlByCode(code, body);
  }
}
