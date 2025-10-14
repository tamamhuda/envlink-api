import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import LoggerService from 'src/common/logger/logger.service';
import { ShortenUrlDto } from './dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { UpdateUrlDto, UrlDto, UrlResponse, UrlsResponse } from './dto/url.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('urls')
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,

    private readonly logger: LoggerService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiCreatedResponse({
    type: UrlResponse,
    description: 'Created a new short URL',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(UrlDto)
  async createUrls(
    @Req() req: Request,
    @Body() body: ShortenUrlDto,
  ): Promise<UrlDto> {
    return await this.urlsService.createUrl(body, req.user);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UrlResponse,
    description: 'Get a short URL for a private access',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlDto)
  async getUrlById(@Param('id') id: string): Promise<UrlDto> {
    return await this.urlsService.getUrlById(id);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UrlsResponse,
    description: 'Get all short URLs for a user',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([UrlDto])
  async getUrls(@Req() req: Request): Promise<UrlDto[]> {
    return await this.urlsService.getUserUrls(req);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiOkResponse({
    type: UrlResponse,
    description: 'Update a short URL',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlDto)
  async updateUrl(
    @Param('id') id: string,
    @Body() body: UpdateUrlDto,
  ): Promise<UrlDto> {
    return await this.urlsService.updateUrl(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUrl(@Param('id') id: string): Promise<void> {
    await this.urlsService.deleteUrl(id);
  }
}
