import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import LoggerService from 'src/infrastructure/logger/logger.service';
import { ShortenUrlBodyDto, ShortenUrlRequest } from './dto/shorten.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  UrlDto,
  UrlResponse,
  UrlSerializerDto,
  UrlPaginatedResponse,
  UrlPaginatedSerializerDto,
  UrlPaginatedDto,
} from './dto/url.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import {
  PaginatedQuery,
  PaginatedQueryDto,
} from 'src/common/dto/paginated.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';

import { FilterQueryDto } from './dto/filter-query.dto';
import { ApiUrlFilterQuery } from './decorators/api-filter-query.decorator';
import {
  BulkUpdateUrlsBodyDto,
  BulkUpdateUrlsRequest,
} from './dto/bulk-udate.dto';
import { OkDto, OkResponse } from 'src/common/dto/response.dto';
import {
  BulkDeleteUrlsBodyDto,
  BulkDeleteUrlsRequest,
} from './dto/bulk-delete.dto';
import { UpdateUrlBodyDto, UpdateUrlRequest } from './dto/update.dto';
import { JWT_SECURITY } from 'src/config/jwt.config';
import { SkipThrottle } from 'src/infrastructure/internal-services/throttle/decorators/skip-throttle.decorator';
import { ThrottlePlan } from 'src/infrastructure/internal-services/throttle/decorators/throttle-plan.decorator';
import { ApiPaginationQuery } from 'src/common/decorators/api-pagination.decorator';
import { AuthenticatedUser } from 'src/security/decorators/authenticated-user.dto';

@ApiBearerAuth(JWT_SECURITY)
@Controller('urls')
@ApiTags('Urls')
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
  @ApiBody({
    type: ShortenUrlRequest,
    description: 'Request body to shorten a URL',
  })
  @ApiOperation({ operationId: 'Shorten', summary: 'Create a new URL' })
  @ApiCreatedResponse({
    type: UrlResponse,
    description: 'Created a new URL',
  })
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(UrlSerializerDto)
  async createUrls(
    @AuthenticatedUser() user: UserInfo,
    @Body() body: ShortenUrlBodyDto,
  ): Promise<UrlDto> {
    return await this.urlsService.createUrl(body, user);
  }

  @SkipThrottle()
  @Get(':code')
  @ApiOperation({ operationId: 'GetByCode', summary: 'Get a URL by code' })
  @ApiOkResponse({
    type: UrlResponse,
    description: 'Get a URL by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlSerializerDto)
  async getUrlByCode(@Param('code') code: string): Promise<UrlDto> {
    return await this.urlsService.getUrlByCode(code);
  }

  @SkipThrottle()
  @Get()
  @ApiOperation({
    operationId: 'GetAll',
    summary: 'Get all URLs paginated',
  })
  @ApiOkResponse({
    type: UrlPaginatedResponse,
    description: 'Get all URLs paginated for a user successfully',
  })
  @ApiPaginationQuery()
  @ApiUrlFilterQuery()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlPaginatedSerializerDto)
  async getUrls(
    @AuthenticatedUser() user: UserInfo,
    @Query() pagination: PaginatedQueryDto,
    @Query(new ValidationPipe({ transform: true })) filter: FilterQueryDto,
  ): Promise<UrlPaginatedDto> {
    return await this.urlsService.getUrlsPaginated(user.id, pagination, filter);
  }

  @SkipThrottle()
  @Patch('bulk')
  @ApiBody({
    type: BulkUpdateUrlsRequest,
    description: 'Request body to update URLs',
  })
  @ApiOperation({
    operationId: 'BulkUpdate',
    summary: 'Update URLs',
  })
  @ApiOkResponse({
    type: OkResponse,
    description: 'Update URLs successfully',
  })
  @HttpCode(HttpStatus.OK)
  async bulkUpdateUrls(
    @AuthenticatedUser() user: UserInfo,
    @Body() body: BulkUpdateUrlsBodyDto,
  ): Promise<OkDto> {
    return await this.urlsService.bulkUpdateUrls(user.id, body);
  }

  @SkipThrottle()
  @Delete('bulk')
  @ApiBody({
    type: BulkDeleteUrlsRequest,
    description: 'Request body to delete URLs',
  })
  @ApiOperation({
    operationId: 'BulkDelete',
    summary: 'Delete URLs',
  })
  @ApiOkResponse({
    type: OkResponse,
    description: 'Delete URLs successfully',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDeleteUrls(
    @AuthenticatedUser() user: UserInfo,
    @Body() body: BulkDeleteUrlsBodyDto,
  ): Promise<OkDto> {
    return await this.urlsService.bulkDeleteUrls(user.id, body);
  }

  @SkipThrottle()
  @Patch(':id')
  @ApiBody({
    type: UpdateUrlRequest,
    description: 'Request body to update a URL',
  })
  @ApiOperation({
    operationId: 'Update',
    summary: 'Update a URL',
  })
  @ApiOkResponse({
    type: UrlResponse,
    description: 'Update a URL successfully',
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
  @ApiOperation({
    operationId: 'DeleteById',
    summary: 'Delete a URL',
  })
  @ApiNoContentResponse({
    description: 'Delete a URL successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUrl(@Param('id') id: string): Promise<void> {
    await this.urlsService.deleteUrl(id);
  }
}
