import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import LoggerService from 'src/logger/logger.service';
import { ShortenUrlDto } from './dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { PublicUrlDto, PublicUrlResponse, UnlockUrlDto } from './dto/url.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('public/urls')
export class PublicUrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly logger: LoggerService,
  ) {}

  @Post('shorten')
  @ApiCreatedResponse({
    type: PublicUrlResponse,
    description: 'Created a new public short URL',
  })
  @ZodSerializerDto(PublicUrlDto)
  async shortenUrl(@Body() body: ShortenUrlDto): Promise<PublicUrlDto> {
    return await this.urlsService.createUrl(body);
  }

  @Get(':code')
  @ApiOkResponse({
    type: PublicUrlResponse,
    description: 'Get a short URL for a public access',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(PublicUrlDto)
  async getUrl(@Param('code') code: string): Promise<PublicUrlDto> {
    return await this.urlsService.getUrlByCode(code);
  }

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
