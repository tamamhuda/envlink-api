import { Injectable, NotFoundException } from '@nestjs/common';
import { UrlLogsQueryDto, TimelineQueryDto } from './dto/query.dto';
import { UrlAnalyticLogDto, UrlAnalyticLogPaginatedDto } from './dto/log-dto';
import { AnalyticRepository } from 'src/database/repositories/analytic.repository';
import { UrlAnalyticsOverviewDto } from './dto/overview.dto';
import { UrlRepository } from 'src/database/repositories/url.repository';
import {
  UrlAnalyticStatDto,
  UrlAnalyticStatPaginatedDto,
} from './dto/url-stat.dto';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { UrlAnalyticTimelineDto } from './dto/timeline.dto';
import { PaginatedQueryDto } from 'src/common/dto/paginated.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated.interface';
import { UrlAnalyticsSegmentsDto } from './dto/segments.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticRepository,
    private readonly urlRepository: UrlRepository,
    private readonly urlGenService: UrlGeneratorService,
  ) {}

  async getOverview(
    userId: string,
    limit: number = 2,
  ): Promise<UrlAnalyticsOverviewDto> {
    const [totalVisits, uniqueVisitors, topCountries, topUrls] =
      await Promise.all([
        this.analyticsRepository.countTotalVisits(userId),
        this.analyticsRepository.countUniqueVisitors(userId),
        this.analyticsRepository.getTopCountries(userId, limit),
        this.analyticsRepository.getTopUrls(userId, limit),
      ]);

    return {
      totalVisits,
      uniqueVisitors,
      topCountries,
      topUrls,
    };
  }

  async getAllUrlStats(
    userId: string,
    pagination: PaginatedQueryDto,
  ): Promise<UrlAnalyticStatPaginatedDto> {
    const url = this.urlGenService.generateUrlFromPath({
      relativePath: 'analytics/urls/stats',
    });

    return await this.analyticsRepository.getAllUrlStatsPaginated(userId, {
      limit: pagination.limit ?? 10,
      page: pagination.page ?? 1,
      url,
    });
  }

  async getAllUrlTimeline(
    userId: string,
    query?: TimelineQueryDto,
  ): Promise<UrlAnalyticTimelineDto[]> {
    return await this.analyticsRepository.getAllUrlTimeline(userId, query);
  }

  async getAllUrlLogs(
    userId: string,
    query: UrlLogsQueryDto = {},
    pagination?: PaginatedQueryDto,
  ): Promise<PaginatedResult<UrlAnalyticLogDto>> {
    const url = this.urlGenService.generateUrlFromPath({
      relativePath: 'analytics/urls/logs',
    });

    const urlLogsPaginated = await this.analyticsRepository.getAllUrlLogs(
      userId,
      query,
      {
        limit: pagination?.limit ?? 10,
        page: pagination?.page ?? 1,
        url: url,
      },
    );

    const urlLogsDto: UrlAnalyticLogDto[] = urlLogsPaginated.data.map((i) => ({
      ...i,
      countryCode: i.country,
      urlId: i.url.id,
      channels: i.channels.map((channel) => channel.name),
    }));

    console.log(JSON.stringify(urlLogsDto, null, 2));

    return {
      ...urlLogsPaginated,
      data: urlLogsDto,
    };
  }

  async getUrlStatsById(
    userId: string,
    id: string,
  ): Promise<UrlAnalyticStatDto> {
    const urlStats = await this.analyticsRepository.getUrlStatsById(userId, id);

    if (!urlStats) {
      throw new NotFoundException('Url not found');
    }
    return urlStats;
  }

  async getUrlTimelineById(
    userId: string,
    id: string,
    query?: TimelineQueryDto,
  ): Promise<UrlAnalyticTimelineDto[]> {
    return await this.analyticsRepository.getUrlTimelineById(userId, id, query);
  }

  async getUrlLogsById(
    userId: string,
    id: string,
    options: UrlLogsQueryDto,
    pagination: PaginatedQueryDto,
  ): Promise<UrlAnalyticLogPaginatedDto> {
    const url = this.urlGenService.generateUrlFromPath({
      relativePath: 'analytics/urls/logs',
    });

    const urlLogsPaginated = await this.analyticsRepository.getUrlLogsById(
      userId,
      id,
      options,
      {
        limit: pagination.limit ?? 10,
        page: pagination.page ?? 1,
        url,
      },
    );

    const urlLogsDto: UrlAnalyticLogDto[] = urlLogsPaginated.data.map((i) => {
      return {
        ...i,
        countryCode: i.country,
        urlId: i.url.id,
        channels: i.channels.map((channel) => channel.name),
      };
    });

    return {
      ...urlLogsPaginated,
      data: urlLogsDto,
    };
  }

  async getUrlsSegments(userId: string): Promise<UrlAnalyticsSegmentsDto> {
    return await this.analyticsRepository.getGlobalSegments(userId);
  }
}
