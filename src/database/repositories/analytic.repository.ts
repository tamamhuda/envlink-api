import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Analytic } from '../entities/analytic.entity';

import {
  UrlAnalyticStat,
  UrlAnalyticStatDto,
} from 'src/analytics/dto/url-stat.dto';
import { PaginatedOptions } from 'src/common/interfaces/paginated.interface';
import { Url } from '../entities/url.entity';
import { paginatedResult } from 'src/common/utils/paginate.util';
import { UrlLogsQueryDto, TimelineQueryDto } from 'src/analytics/dto/query.dto';

@Injectable()
export class AnalyticRepository extends Repository<Analytic> {
  constructor(private readonly dataSource: DataSource) {
    super(Analytic, dataSource.createEntityManager());
  }

  async createOne(data: Partial<Analytic>): Promise<Analytic> {
    const analytic = this.create(data);
    return this.save(analytic);
  }

  async findOneByIdentityHash(identityHash: string): Promise<Analytic | null> {
    return await this.findOne({ where: { identityHash }, relations: ['url'] });
  }

  async countTotalVisits(userId: string): Promise<number> {
    const result = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .select('COALESCE(SUM(a.visitorCount), 0)', 'total')
      .getRawOne();

    return Number(result.total);
  }

  async countUniqueVisitors(userId: string): Promise<number> {
    const result = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .select('COUNT(*)', 'uniqueVisitors')
      .where('url.userId = :userId AND a.isUnique = true', { userId })
      .getRawOne();

    return Number(result?.uniqueVisitors ?? 0);
  }

  async getTopCountries(userId: string, limit = 3) {
    const raw = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere('a.country IS NOT NULL')
      .andWhere('a.country != :unknown', { unknown: 'Unknown' })
      .select('a.country', 'country')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .groupBy('a.country')
      .having('SUM(a.visitorCount) > 0')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();

    return raw.map((r) => ({
      country: r.country,
      totalVisits: Number(r.total),
    }));
  }
  private async getBreakdown(urlIds: string[]) {
    if (!urlIds.length) return {};

    const rows = await this.createQueryBuilder('a')
      .select('"a"."urlId"', 'urlId')
      .addSelect("COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')", 'device')
      .addSelect("COALESCE(NULLIF(a.os,'Unknown'),'Unknown')", 'os')
      .addSelect("COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')", 'browser')
      .addSelect("COALESCE(NULLIF(a.country,'Unknown'),'Unknown')", 'country')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .addSelect(
        `SUM(CASE WHEN a.isUnique = TRUE THEN a.visitorCount ELSE 0 END)::int`,
        'unique',
      )
      .where('a.urlId IN (:...urlIds)', { urlIds })
      .groupBy('"a"."urlId"')
      .addGroupBy('device')
      .addGroupBy('os')
      .addGroupBy('browser')
      .addGroupBy('country')
      .getRawMany<{
        urlId: string;
        device: string;
        os: string;
        browser: string;
        country: string;
        total: number;
        unique: number;
      }>();

    const result: Record<string, any> = {};

    for (const r of rows) {
      if (!result[r.urlId]) {
        result[r.urlId] = {
          deviceVisits: {},
          osVisits: {},
          browserVisits: {},
          countryVisits: [],
        };
      }

      // Aggregate device
      if (!result[r.urlId].deviceVisits[r.device]) {
        result[r.urlId].deviceVisits[r.device] = { total: 0, unique: 0 };
      }
      result[r.urlId].deviceVisits[r.device].total += r.total;
      result[r.urlId].deviceVisits[r.device].unique += r.unique;

      // Aggregate OS
      if (!result[r.urlId].osVisits[r.os]) {
        result[r.urlId].osVisits[r.os] = { total: 0, unique: 0 };
      }
      result[r.urlId].osVisits[r.os].total += r.total;
      result[r.urlId].osVisits[r.os].unique += r.unique;

      // Aggregate browser
      if (!result[r.urlId].browserVisits[r.browser]) {
        result[r.urlId].browserVisits[r.browser] = { total: 0, unique: 0 };
      }
      result[r.urlId].browserVisits[r.browser].total += r.total;
      result[r.urlId].browserVisits[r.browser].unique += r.unique;

      // Aggregate country
      const existingCountry = result[r.urlId].countryVisits.find(
        (c: any) => c.country === r.country,
      );
      if (existingCountry) {
        existingCountry.total += r.total;
        existingCountry.unique += r.unique;
      } else {
        result[r.urlId].countryVisits.push({
          country: r.country,
          total: r.total,
          unique: r.unique,
        });
      }
    }

    return result;
  }

  async getTopUrls(userId: string, limit = 3) {
    const rows = await this.getUrlAggregates(userId, {
      limit,
      orderByTotal: true,
    });
    if (!rows.length) return [];

    const urlIds = rows.map((r) => r.urlId);
    const urls = await this.findManyUrls(urlIds);
    const breakdown = await this.getBreakdown(urlIds);

    return rows.map((r) => {
      const urlBreakdown = breakdown[r.urlId];
      return {
        url: urls.find((u) => u.id === r.urlId)!,
        totalVisit: r.total,
        uniqueVisitors: r.unique,
        firstVisit: r.firstVisit ?? null,
        lastVisit: r.lastVisit ?? null,
        deviceVisits: urlBreakdown.deviceVisits,
        osVisits: urlBreakdown.osVisits,
        browserVisits: urlBreakdown.browserVisits,
        countryVisits: urlBreakdown.countryVisits,
      };
    });
  }

  // Get paginated URL stats
  async getAllUrlStatsPaginated(
    userId: string,
    options: PaginatedOptions = {
      page: 1,
      limit: 10,
      url: '',
    },
  ) {
    const { limit, page } = options;
    const offset = (page - 1) * limit;

    // Fetch paginated URL stats
    const rows = await this.getUrlStats(userId, { limit, offset });

    // Total count
    const countRow = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .select('COUNT(DISTINCT url.id)', 'total')
      .getRawOne<{ total: string }>();
    const totalItems = Number(countRow?.total ?? 0);

    const urlIds = rows.map((r) => r.urlId);
    const urls = await this.findManyUrls(urlIds);

    // Fetch breakdown per URL
    const breakdowns = await this.getBreakdown(urlIds);

    // Map data to DTO
    const data = rows.map((r) => {
      const urlBreakdown = breakdowns[r.urlId] ?? {
        deviceVisits: null,
        osVisits: null,
        browserVisits: null,
        countryVisits: null,
      };

      return {
        url: urls.find((u) => u.id === r.urlId)!,
        totalVisit: Number(r.total),
        uniqueVisitors: Number(r.unique),
        firstVisit: r.firstVisit ?? null,
        lastVisit: r.lastVisit ?? null,
        deviceVisits: urlBreakdown.deviceVisits,
        osVisits: urlBreakdown.osVisits,
        browserVisits: urlBreakdown.browserVisits,
        countryVisits: urlBreakdown.countryVisits,
      };
    });

    return paginatedResult<UrlAnalyticStat>(data, totalItems, options);
  }

  // Helper for base aggregation
  private async getUrlStats(
    userId: string,
    options?: { limit?: number; offset?: number; orderByTotal?: boolean },
  ) {
    const qb = this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .select('url.id', 'urlId')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .addSelect(
        `SUM(CASE WHEN a.isUnique = TRUE THEN a.visitorCount ELSE 0 END)::int`,
        'unique',
      )
      .addSelect('MIN(a.createdAt)', 'firstVisit') // add firstVisit
      .addSelect('MAX(a.createdAt)', 'lastVisit') // add lastVisit
      .groupBy('url.id');

    if (options?.orderByTotal) qb.orderBy('total', 'DESC');
    if (options?.limit !== undefined) qb.limit(options.limit);
    if (options?.offset !== undefined) qb.offset(options.offset);

    return await qb.getRawMany<{
      urlId: string;
      total: number;
      unique: number;
      firstVisit: Date;
      lastVisit: Date;
    }>();
  }

  // Example for getUrlStatsById or getTopUrls
  async getUrlStatsById(
    userId: string,
    id: string,
  ): Promise<UrlAnalyticStatDto | null> {
    const [raw] = await this.getUrlAggregates(userId, { urlId: id });
    if (!raw) return null;

    const url = await this.findOneOrUrl(raw.urlId);
    const breakdown = await this.getBreakdown([raw.urlId]);
    const urlBreakdown = breakdown[raw.urlId];

    return {
      url,
      totalVisit: raw.total,
      uniqueVisitors: raw.unique,
      firstVisit: raw.firstVisit ?? null,
      lastVisit: raw.lastVisit ?? null,
      deviceVisits: urlBreakdown.deviceVisits,
      osVisits: urlBreakdown.osVisits,
      browserVisits: urlBreakdown.browserVisits,
      countryVisits: urlBreakdown.countryVisits,
    };
  }

  private async getUrlAggregates(
    userId: string,
    options?: {
      urlId?: string;
      limit?: number;
      offset?: number;
      orderByTotal?: boolean;
    },
  ) {
    const qb = this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .select('url.id', 'urlId')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .addSelect(
        `SUM(CASE WHEN a.isUnique = TRUE THEN a.visitorCount ELSE 0 END)::int`,
        'unique',
      )
      .addSelect('MIN(a.createdAt)', 'firstVisit')
      .addSelect('MAX(a.createdAt)', 'lastVisit')
      .groupBy('url.id');

    if (options?.urlId)
      qb.andWhere('url.id = :urlId', { urlId: options.urlId });
    if (options?.orderByTotal) qb.orderBy('total', 'DESC');
    if (options?.limit !== undefined) qb.limit(options.limit);
    if (options?.offset !== undefined) qb.offset(options.offset);

    return qb.getRawMany<{
      urlId: string;
      total: number;
      unique: number;
      firstVisit: Date;
      lastVisit: Date;
    }>();
  }

  private async findManyUrls(urlIds: string[]): Promise<Url[]> {
    const urlRepo = this.dataSource.getRepository(Url);

    return await urlRepo.find({
      where: { id: In(urlIds) },
      relations: ['channels'],
    });
  }

  private async findOneOrUrl(id: string) {
    const urlRepo = this.dataSource.getRepository(Url);

    return await urlRepo.findOneOrFail({
      where: { id },
      relations: ['channels'],
    });
  }

  async getAllUrlTimeline(userId: string, options: TimelineQueryDto = {}) {
    const to = options.to ?? new Date();
    const from =
      options.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days

    const interval = options.interval || 'day';
    const dateTrunc = interval;

    const qb = this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere('a.createdAt >= :from AND a.createdAt <= :to', { from, to })
      .select(`DATE_TRUNC('${dateTrunc}', a.createdAt)`, 'timestamp')
      .addSelect('SUM(a.visitorCount)::int', 'totalVisits')
      .addSelect(
        'SUM(CASE WHEN a.isUnique THEN a.visitorCount ELSE 0 END)::int',
        'uniqueVisits',
      )
      .groupBy('timestamp')
      .orderBy('timestamp', 'ASC');

    const rows = await qb.getRawMany<{
      timestamp: Date;
      totalVisits: number;
      uniqueVisits: number;
    }>();

    return rows.map((r) => ({
      timestamp: r.timestamp,
      totalVisits: r.totalVisits,
      uniqueVisits: r.uniqueVisits,
    }));
  }

  async getUrlTimelineById(
    userId: string,
    urlId: string,
    options: TimelineQueryDto = {},
  ) {
    const to = options.to ?? new Date();
    const from =
      options.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days

    const interval = options.interval || 'day';
    const dateTrunc = interval;

    const qb = this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere('url.id = :urlId', { urlId })
      .andWhere('a.createdAt >= :from AND a.createdAt <= :to', { from, to })
      .select(`DATE_TRUNC('${dateTrunc}', a.createdAt)`, 'timestamp')
      .addSelect('SUM(a.visitorCount)::int', 'totalVisits')
      .addSelect(
        'SUM(CASE WHEN a.isUnique THEN a.visitorCount ELSE 0 END)::int',
        'uniqueVisits',
      )
      .groupBy('timestamp')
      .orderBy('timestamp', 'ASC');

    const rows = await qb.getRawMany<{
      timestamp: Date;
      totalVisits: number;
      uniqueVisits: number;
    }>();

    return rows.map((r) => ({
      timestamp: r.timestamp,
      totalVisits: r.totalVisits,
      uniqueVisits: r.uniqueVisits,
    }));
  }

  async getAllUrlLogs(
    userId: string,
    options: UrlLogsQueryDto,
    paginate: PaginatedOptions,
  ) {
    const to = options.to ?? new Date();
    const from =
      options.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days
    const page = paginate.page || 1;
    const limit = paginate.limit || 10;

    const qb = this.createQueryBuilder('a')
      .leftJoinAndSelect('a.url', 'url')
      .leftJoinAndSelect('a.channels', 'channels')
      .where('url.userId = :userId', { userId })
      .andWhere('a.createdAt BETWEEN :from AND :to', { from, to })
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // get total count for pagination
    const [rows, totalItems] = await qb.getManyAndCount();

    return paginatedResult<Analytic>(rows, totalItems, paginate);
  }

  async getUrlLogsById(
    userId: string,
    urlId: string,
    options: UrlLogsQueryDto,
    paginate: PaginatedOptions,
  ) {
    const to = options.to ?? new Date();
    const from =
      options.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days
    const page = paginate.page || 1;
    const limit = paginate.limit || 10;

    const qb = this.createQueryBuilder('a')
      .leftJoinAndSelect('a.url', 'url')
      .leftJoinAndSelect('a.channels', 'channels')
      .where('url.userId = :userId', { userId })
      .andWhere('url.id = :urlId', { urlId })
      .andWhere('a.createdAt BETWEEN :from AND :to', { from, to })
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, totalItems] = await qb.getManyAndCount();

    return paginatedResult<Analytic>(rows, totalItems, paginate);
  }
}
