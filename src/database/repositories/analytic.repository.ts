import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Analytic } from '../entities/analytic.entity';

import {
  UrlAnalyticStat,
  UrlAnalyticStatDto,
} from 'src/analytics/dto/url-stat.dto';
import {
  PaginatedOptions,
  PaginatedResult,
} from 'src/common/interfaces/paginated.interface';
import { Url } from '../entities/url.entity';
import { paginatedResult } from 'src/common/utils/paginate.util';
import { UrlLogsQueryDto, TimelineQueryDto } from 'src/analytics/dto/query.dto';
import { AnalyticUtil } from '../utils/analytic.util';

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
      .select(
        "COALESCE(NULLIF(a.country, 'Unknown'), 'Unknown')",
        'countryCode',
      )
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .groupBy('a.country')
      .having('SUM(a.visitorCount) > 0')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();

    console.log(JSON.stringify(raw, null, 2));

    return raw.map((r) => ({
      countryCode: r.countryCode,
      totalVisits: Number(r.total),
    }));
  }
  async getListUrlsSegments(urlIds: string[]) {
    if (!urlIds.length) return {};

    const rows = await this.createQueryBuilder('a')
      .select('"a"."urlId"', 'urlId')
      .addSelect("COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')", 'device')
      .addSelect("COALESCE(NULLIF(a.os,'Unknown'),'Unknown')", 'os')
      .addSelect("COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')", 'browser')
      .addSelect(
        "COALESCE(NULLIF(a.country,'Unknown'),'Unknown')",
        'countryCode',
      )
      .addSelect("COALESCE(NULLIF(a.region,'Unknown'),'Unknown')", 'region')
      .addSelect("COALESCE(NULLIF(a.city,'Unknown'),'Unknown')", 'city')
      .addSelect("COALESCE(NULLIF(a.referrer,''),'Direct')", 'referrer')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .addSelect(
        `
        SUM(
          CASE WHEN a.isUnique = TRUE THEN a.visitorCount ELSE 0 END
        )::int
      `,
        'unique',
      )
      .where('a.urlId IN (:...urlIds)', { urlIds })
      .groupBy('"a"."urlId"')
      .addGroupBy('device')
      .addGroupBy('os')
      .addGroupBy('browser')
      .addGroupBy('country')
      .addGroupBy('region')
      .addGroupBy('city')
      .addGroupBy('referrer')
      .getRawMany();

    return AnalyticUtil.reduceByUrl(rows);
  }

  async getGlobalSegments(userId: string) {
    const rows = await this.createQueryBuilder('a')
      .select("COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')", 'device')
      .addSelect("COALESCE(NULLIF(a.os,'Unknown'),'Unknown')", 'os')
      .addSelect("COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')", 'browser')
      .addSelect(
        "COALESCE(NULLIF(a.country,'Unknown'),'Unknown')",
        'countryCode',
      )
      .addSelect("COALESCE(NULLIF(a.region,'Unknown'),'Unknown')", 'region')
      .addSelect("COALESCE(NULLIF(a.city,'Unknown'),'Unknown')", 'city')
      .addSelect("COALESCE(NULLIF(a.referrer,''),'Direct')", 'referrer')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .addSelect(
        `
        SUM(
          CASE WHEN a.isUnique = TRUE THEN a.visitorCount ELSE 0 END
        )::int
      `,
        'unique',
      )
      .leftJoin('a.url', 'url')
      .leftJoin('a.channels', 'channels')
      .where('url.userId = :userId', { userId })
      .groupBy('device')
      .addGroupBy('os')
      .addGroupBy('browser')
      .addGroupBy('country')
      .addGroupBy('region')
      .addGroupBy('city')
      .addGroupBy('referrer')
      .getRawMany();

    return AnalyticUtil.reduceRows(rows);
  }

  async getTopUrls(userId: string, limit = 3) {
    const rows = await this.getUrlAggregates(userId, {
      limit,
      orderByTotal: true,
    });
    if (!rows.length) return [];

    const urlIds = rows.map((r) => r.urlId);
    const urls = await this.findManyUrls(urlIds);
    const urlsSegments = await this.getListUrlsSegments(urlIds);

    return rows.map((r) => {
      const segments = urlsSegments[r.urlId];
      return {
        url: urls.find((u) => u.id === r.urlId)!,
        totalVisit: r.total,
        uniqueVisitors: r.unique,
        firstVisit: r.firstVisit ?? null,
        lastVisit: r.lastVisit ?? null,
        ...segments,
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
    const { limit = 10, page = 1 } = options;
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

    // Fetch segments per URL
    const urlsSegments = await this.getListUrlsSegments(urlIds);

    // Map data to DTO
    const data = rows.map((r) => {
      const segments = urlsSegments[r.urlId];

      return {
        url: urls.find((u) => u.id === r.urlId)!,
        totalVisit: Number(r.total),
        uniqueVisitors: Number(r.unique),
        firstVisit: r.firstVisit ?? null,
        lastVisit: r.lastVisit ?? null,
        ...segments,
      };
    });

    return paginatedResult<UrlAnalyticStat>(data, totalItems, options);
  }

  // Example for getUrlStatsById or getTopUrls
  async getUrlStatsById(
    userId: string,
    id: string,
  ): Promise<UrlAnalyticStatDto | null> {
    const [raw] = await this.getUrlAggregates(userId, { urlId: id });
    if (!raw) return null;

    const url = await this.findOneOrUrl(raw.urlId);
    const urlsSegments = await this.getListUrlsSegments([raw.urlId]);
    const segments = urlsSegments[raw.urlId];

    return {
      url,
      totalVisit: raw.total,
      uniqueVisitors: raw.unique,
      firstVisit: raw.firstVisit ?? null,
      lastVisit: raw.lastVisit ?? null,
      ...segments,
    };
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
  ): Promise<PaginatedResult<Analytic>> {
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
}
