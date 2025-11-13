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
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import LoggerService from 'src/common/logger/logger.service';
import { ShortenUrlBodyDto } from './dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  UpdateUrlBodyDto,
  UrlDto,
  UrlResponse,
  AllUrlsResponse,
  UrlSerializerDto,
} from './dto/url.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ThrottlePlan } from 'src/common/throttle/decorators/throttle-plan.decorator';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';

@ApiBearerAuth(JWT_SECURITY)
@Controller('urls')
@ApiTags('Transactions')
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @ThrottlePlan({
    scope: 'shorten',
    cost: 1,
  })
  @ApiOperation({ summary: 'Create a new short URL' })
  @ApiCreatedResponse({
    type: UrlResponse,
    description: 'Created a new short URL',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(UrlSerializerDto)
  async createUrls(
    @Req() req: Request,
    @Body() body: ShortenUrlBodyDto,
  ): Promise<UrlDto> {
    return await this.urlsService.createUrl(body, req.user);
  }

  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: 'Get a short URL by id' })
  @ApiOkResponse({
    type: UrlResponse,
    description: 'Get a short URL by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlSerializerDto)
  async getUrlById(@Param('id') id: string): Promise<UrlDto> {
    return await this.urlsService.getUrlById(id);
  }

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Get all short URLs for a user' })
  @ApiOkResponse({
    type: AllUrlsResponse,
    description: 'Get all short URLs for a user successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([UrlSerializerDto])
  async getUrls(@Req() req: Request): Promise<UrlDto[]> {
    return await this.urlsService.getUserUrls(req);
  }

  @SkipThrottle()
  @Put(':id')
  @ApiOperation({ summary: 'Update a short URL' })
  @ApiOkResponse({
    type: UrlResponse,
    description: 'Update a short URL',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlSerializerDto)
  async updateUrl(
    @Param('id') id: string,
    @Body() body: UpdateUrlBodyDto,
  ): Promise<UrlDto> {
    return await this.urlsService.updateUrl(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a short URL' })
  @ApiNoContentResponse({
    description: 'Delete a short URL successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUrl(@Param('id') id: string): Promise<void> {
    await this.urlsService.deleteUrl(id);
  }
}
