import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Request } from 'express';
import { TimelineQueryDto, UrlLogsQueryDto } from './dto/query.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  UrlAnalyticLogPaginatedDto,
  UrlAnalyticLogPaginatedResponse,
  UrlAnalyticLogPaginatedSerializerDto,
} from './dto/log-dto';
import {
  UrlAnalyticsOverviewDto,
  UrlAnalyticsOverviewResponse,
  UrlAnalyticsOverviewSerializerDto,
} from './dto/overview.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from 'src/common/throttle/decorators/skip-throttle.decorator';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.dto';
import { UserInfo } from 'src/auth/dto/user-info.dto';
import {
  UrlAnalyticStatSerializerDto,
  UrlAnalyticStatPaginatedDto,
  UrlAnalyticStatPaginatedResponse,
  UrlAnalyticStatPaginatedSerializerDto,
  UrlAnalyticStatDto,
  UrlAnalyticStatResponse,
} from './dto/url-stat.dto';
import {
  UrlAnalyticTimelineDto,
  UrlAnalyticTimelineResponse,
  UrlAnalyticTimelineSerializerDto,
} from './dto/timeline.dto';
import { PaginatedQueryDto } from 'src/common/dto/paginated.dto';

@Controller('analytics/urls')
@SkipThrottle()
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  // Global summary
  @Get('overview')
  @ApiOperation({
    operationId: 'getUrlsOverview',
    summary: 'Overview of url analytics',
  })
  @ApiOkResponse({
    type: UrlAnalyticsOverviewResponse,
    description: 'Get url analytics overview successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlAnalyticsOverviewSerializerDto)
  getOverview(
    @AuthenticatedUser() user: UserInfo,
  ): Promise<UrlAnalyticsOverviewDto> {
    return this.service.getOverview(user.id);
  }

  @Get('stats')
  @ApiOperation({
    operationId: 'getAllUrlStats',
    summary: 'Get all analytics stats of urls',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Page size',
    default: 10,
  })
  @ApiOkResponse({
    type: UrlAnalyticStatPaginatedResponse,
    description: 'Get all analytics stats of urls successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlAnalyticStatPaginatedSerializerDto)
  getStats(
    @AuthenticatedUser() user: UserInfo,
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: PaginatedQueryDto,
  ): Promise<UrlAnalyticStatPaginatedDto> {
    return this.service.getAllUrlStats(user.id, query);
  }

  @Get('timeline')
  @ApiOperation({
    operationId: 'getAllUrlTimeline',
    summary: 'Get all timeline of urls',
  })
  @ApiOkResponse({
    type: UrlAnalyticTimelineDto,
    description: 'Get all timeline of urls successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([UrlAnalyticTimelineSerializerDto])
  getTimeline(
    @AuthenticatedUser() user: UserInfo,
    @Query(new ValidationPipe()) query: TimelineQueryDto,
  ) {
    return this.service.getAllUrlTimeline(user.id, query);
  }

  @Get('logs')
  @ApiOperation({
    operationId: 'getAllUrlLogs',
    summary: 'Get all analytics logs of urls',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Page size',
    default: 10,
  })
  @ApiOkResponse({
    type: UrlAnalyticLogPaginatedResponse,
    description: 'Get all analytics logs of urls successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlAnalyticLogPaginatedSerializerDto)
  getLogs(
    @AuthenticatedUser() user: UserInfo,
    @Query(new ValidationPipe({ transform: true })) options: UrlLogsQueryDto,
    @Query(new ValidationPipe({ transform: true }))
    pagination: PaginatedQueryDto,
  ): Promise<UrlAnalyticLogPaginatedDto> {
    return this.service.getAllUrlLogs(user.id, options, pagination);
  }

  @Get(':urlId/stats')
  @ApiOperation({
    operationId: 'getUrlStatsById',
    summary: 'Get analytics stats of url by id',
  })
  @ApiOkResponse({
    type: UrlAnalyticStatResponse,
    description: 'Get analytics stats of url by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlAnalyticStatSerializerDto)
  getUrlStats(
    @AuthenticatedUser() user: UserInfo,
    @Param('urlId') id: string,
  ): Promise<UrlAnalyticStatDto> {
    return this.service.getUrlStatsById(user.id, id);
  }

  @Get(':urlId/timeline')
  @Get('timeline')
  @ApiOperation({
    operationId: 'getUrlTimelineById',
    summary: 'Get url timeline by id',
  })
  @ApiOkResponse({
    type: UrlAnalyticTimelineResponse,
    description: 'Get url timeline by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto([UrlAnalyticTimelineSerializerDto])
  getUrlTimeline(
    @Req() req: Request,
    @Param('urlId') id: string,
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: TimelineQueryDto,
  ): Promise<UrlAnalyticTimelineDto[]> {
    return this.service.getUrlTimelineById(req.user.id, id, query);
  }

  @Get(':urlId/logs')
  @ApiOperation({
    operationId: 'getUrlLogsById',
    summary: 'Get all analytics logs of url by id',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Page size',
    default: 10,
  })
  @ApiOkResponse({
    type: UrlAnalyticLogPaginatedResponse,
    description: 'Get all analytics logs of url by id successfully',
  })
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(UrlAnalyticLogPaginatedSerializerDto)
  getUrlLogs(
    @Req() req: Request,
    @Param('urlId') id: string,
    @Query() options: UrlLogsQueryDto,
    @Query() pagination: PaginatedQueryDto,
  ) {
    return this.service.getUrlLogsById(req.user.id, id, options, pagination);
  }
}
