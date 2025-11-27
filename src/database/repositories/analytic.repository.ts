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

type CountryVisit = { country: string; total: number; unique: number };
type RegionVisit = { region: string; total: number; unique: number };
type CityVisit = { city: string; total: number; unique: number };

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
  private async getListUrlsSegments(urlIds: string[]) {
    if (!urlIds.length) return {};

    const rows = await this.createQueryBuilder('a')
      .select('"a"."urlId"', 'urlId')
      .addSelect("COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')", 'device')
      .addSelect("COALESCE(NULLIF(a.os,'Unknown'),'Unknown')", 'os')
      .addSelect("COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')", 'browser')
      .addSelect("COALESCE(NULLIF(a.country,'Unknown'),'Unknown')", 'country')
      .addSelect("COALESCE(NULLIF(a.region,'Unknown'),'Unknown')", 'region')
      .addSelect("COALESCE(NULLIF(a.city,'Unknown'),'Unknown')", 'city')
      .addSelect("COALESCE(NULLIF(a.referrer,''),'Direct')", 'referrer')
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
      .addGroupBy('region')
      .addGroupBy('city')
      .addGroupBy('referrer')
      .getRawMany<{
        urlId: string;
        device: string;
        os: string;
        browser: string;
        country: string;
        region: string;
        city: string;
        referrer: string;
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
          regionVisits: [],
          cityVisits: [],
          referrerVisits: {},
        };
      }

      const bucket = result[r.urlId];

      // Device
      if (!bucket.deviceVisits[r.device]) {
        bucket.deviceVisits[r.device] = { total: 0, unique: 0 };
      }
      bucket.deviceVisits[r.device].total += r.total;
      bucket.deviceVisits[r.device].unique += r.unique;

      // OS
      if (!bucket.osVisits[r.os]) {
        bucket.osVisits[r.os] = { total: 0, unique: 0 };
      }
      bucket.osVisits[r.os].total += r.total;
      bucket.osVisits[r.os].unique += r.unique;

      // Browser
      if (!bucket.browserVisits[r.browser]) {
        bucket.browserVisits[r.browser] = { total: 0, unique: 0 };
      }
      bucket.browserVisits[r.browser].total += r.total;
      bucket.browserVisits[r.browser].unique += r.unique;

      // Country
      const c = bucket.countryVisits.find((x: any) => x.country === r.country);
      if (c) {
        c.total += r.total;
        c.unique += r.unique;
      } else {
        bucket.countryVisits.push({
          country: r.country,
          total: r.total,
          unique: r.unique,
        });
      }

      // Region
      const reg = bucket.regionVisits.find((x: any) => x.region === r.region);
      if (reg) {
        reg.total += r.total;
        reg.unique += r.unique;
      } else {
        bucket.regionVisits.push({
          region: r.region,
          total: r.total,
          unique: r.unique,
        });
      }

      // City
      const ct = bucket.cityVisits.find((x: any) => x.city === r.city);
      if (ct) {
        ct.total += r.total;
        ct.unique += r.unique;
      } else {
        bucket.cityVisits.push({
          city: r.city,
          total: r.total,
          unique: r.unique,
        });
      }

      // Referrer
      if (!bucket.referrerVisits[r.referrer]) {
        bucket.referrerVisits[r.referrer] = { total: 0, unique: 0 };
      }
      bucket.referrerVisits[r.referrer].total += r.total;
      bucket.referrerVisits[r.referrer].unique += r.unique;
    }

    return result;
  }

  async getGlobalSegments(userId: string) {
    const rows = await this.createQueryBuilder('a')
      .select("COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')", 'device')
      .addSelect("COALESCE(NULLIF(a.os,'Unknown'),'Unknown')", 'os')
      .addSelect("COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')", 'browser')
      .addSelect("COALESCE(NULLIF(a.country,'Unknown'),'Unknown')", 'country')
      .addSelect("COALESCE(NULLIF(a.region,'Unknown'),'Unknown')", 'region')
      .addSelect("COALESCE(NULLIF(a.city,'Unknown'),'Unknown')", 'city')
      .addSelect("COALESCE(NULLIF(a.referrer,''),'Direct')", 'referrer')
      .addSelect('SUM(a.visitorCount)::int', 'total')
      .addSelect(
        `SUM(CASE WHEN a.isUnique = TRUE THEN a.visitorCount ELSE 0 END)::int`,
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
      .getRawMany<{
        device: string;
        os: string;
        browser: string;
        country: string;
        region: string;
        city: string;
        referrer: string;
        total: number;
        unique: number;
      }>();

    const result = {
      deviceVisits: {} as Record<string, { total: number; unique: number }>,
      osVisits: {} as Record<string, { total: number; unique: number }>,
      browserVisits: {} as Record<string, { total: number; unique: number }>,
      countryVisits: [] as CountryVisit[],
      regionVisits: [] as RegionVisit[],
      cityVisits: [] as CityVisit[],
      referrerVisits: {} as Record<string, { total: number; unique: number }>,
    };

    for (const r of rows) {
      // device
      if (!result.deviceVisits[r.device]) {
        result.deviceVisits[r.device] = { total: 0, unique: 0 };
      }
      result.deviceVisits[r.device].total += r.total;
      result.deviceVisits[r.device].unique += r.unique;

      // os
      if (!result.osVisits[r.os]) {
        result.osVisits[r.os] = { total: 0, unique: 0 };
      }
      result.osVisits[r.os].total += r.total;
      result.osVisits[r.os].unique += r.unique;

      // browser
      if (!result.browserVisits[r.browser]) {
        result.browserVisits[r.browser] = { total: 0, unique: 0 };
      }
      result.browserVisits[r.browser].total += r.total;
      result.browserVisits[r.browser].unique += r.unique;

      // country
      const c = result.countryVisits.find((x) => x.country === r.country);
      if (c) {
        c.total += r.total;
        c.unique += r.unique;
      } else {
        result.countryVisits.push({
          country: r.country,
          total: r.total,
          unique: r.unique,
        });
      }

      // region
      const reg = result.regionVisits.find((x) => x.region === r.region);
      if (reg) {
        reg.total += r.total;
        reg.unique += r.unique;
      } else {
        result.regionVisits.push({
          region: r.region,
          total: r.total,
          unique: r.unique,
        });
      }

      // city
      const ct = result.cityVisits.find((x) => x.city === r.city);
      if (ct) {
        ct.total += r.total;
        ct.unique += r.unique;
      } else {
        result.cityVisits.push({
          city: r.city,
          total: r.total,
          unique: r.unique,
        });
      }

      // referrer
      if (!result.referrerVisits[r.referrer]) {
        result.referrerVisits[r.referrer] = { total: 0, unique: 0 };
      }
      result.referrerVisits[r.referrer].total += r.total;
      result.referrerVisits[r.referrer].unique += r.unique;
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
    const breakdown = await this.getListUrlsSegments(urlIds);

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
        cityVisits: urlBreakdown.cityVisits,
        regionVisits: urlBreakdown.regionVisits,
        referrerVisits: urlBreakdown.referrerVisits,
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
    const breakdowns = await this.getListUrlsSegments(urlIds);

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
        cityVisits: urlBreakdown.cityVisits,
        referrerVisits: urlBreakdown.referrerVisits,
        regionVisits: urlBreakdown.regionVisits,
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
    const breakdown = await this.getListUrlsSegments([raw.urlId]);
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
      cityVisits: urlBreakdown.cityVisits,
      referrerVisits: urlBreakdown.referrerVisits,
      regionVisits: urlBreakdown.regionVisits,
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
