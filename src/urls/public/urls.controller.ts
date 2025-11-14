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
import {
  PublicShortenUrlBodyDto,
  PublicShortenUrlRequest,
} from '../dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  PublicUrlDto,
  PublicUrlResponse,
  PublicUrlSerializerDto,
  UnlockUrlBodyDto,
  UnlockUrlRequest,
} from '../dto/url.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UrlAnalyticInterceptor } from 'src/common/interceptors/url-analytic.interceptor';
import { Public } from 'src/common/decorators/public.decorator';
import { ThrottleScope } from 'src/common/throttle/decorators/throttle-scope.decorator';
import { PolicyScope } from 'src/common/throttle/throttle.constans';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

@Public()
@Controller('public/urls')
@ApiTags('Public URLs')
export class PublicUrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly logger: LoggerService,
  ) {}

  @Post('shorten')
  @ThrottleScope(PolicyScope.SHORTEN_PUBLIC)
  @ApiBody({ type: PublicShortenUrlRequest })
  @ApiOperation({
    operationId: 'Shorten',
    summary: 'Shorten a URL for public access',
  })
  @ApiCreatedResponse({
    type: PublicUrlResponse,
    description: 'Created a new public short URL successfully',
  })
  @ZodSerializerDto(PublicUrlSerializerDto)
  async shortenUrl(
    @Body() body: PublicShortenUrlBodyDto,
  ): Promise<PublicUrlDto> {
    return await this.urlsService.createUrl(body);
  }

  @SkipThrottle()
  @Get(':code')
  @UseInterceptors(UrlAnalyticInterceptor)
  @ApiOperation({
    operationId: 'GetByCode',
    summary: 'Get a short URL for public access',
  })
  @ApiOkResponse({
    type: PublicUrlResponse,
    description: 'Get a short URL for a public access',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PublicUrlSerializerDto)
  async getUrl(@Param('code') code: string): Promise<PublicUrlDto> {
    return await this.urlsService.getUrlByCode(code);
  }

  @SkipThrottle()
  @Post('unlock/:code')
  @ApiOperation({
    operationId: 'Unlock',
    summary: 'Unlock a short URL for public access',
  })
  @ApiBody({
    type: UnlockUrlRequest,
    description: 'Request body for unlocking a short URL',
  })
  @ApiOkResponse({
    type: PublicUrlResponse,
    description: 'Unlock a short URL for a public access',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PublicUrlSerializerDto)
  async unlockUrl(
    @Param('code') code: string,
    @Body() body: UnlockUrlBodyDto,
  ): Promise<PublicUrlDto> {
    return await this.urlsService.unlockUrlByCode(code, body);
  }
}
