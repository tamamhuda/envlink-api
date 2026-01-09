import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Analytic } from '../entities/analytic.entity';
import { Url } from '../entities/url.entity';
import { Channel } from '../entities/channel.entity';
import {
  UrlAnalyticStat,
  UrlAnalyticStatDto,
} from 'src/analytics/dto/url-stat.dto';
import {
  PaginatedOptions,
  PaginatedResult,
} from 'src/common/interfaces/paginated.interface';
import { UrlLogsQueryDto, TimelineQueryDto } from 'src/analytics/dto/query.dto';
import { AnalyticUtil } from '../utils/analytic.util';
import { paginatedResult } from 'src/common/helpers/paginate.helper';

@Injectable()
export class AnalyticRepository extends Repository<Analytic> {
  constructor(private readonly dataSource: DataSource) {
    super(Analytic, dataSource.createEntityManager());
  }

  // --------------------------------------------------
  // Base CRUD
  // --------------------------------------------------
  async createOne(data: Partial<Analytic>): Promise<Analytic> {
    return this.save(this.create(data));
  }

  async findOneByIdentityHash(identityHash: string): Promise<Analytic | null> {
    return this.findOne({ where: { identityHash }, relations: ['url'] });
  }

  // --------------------------------------------------
  // Global counters (type = 'CLICK')
  // --------------------------------------------------
  async countTotalVisits(userId: string): Promise<number> {
    const { total } = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere("a.type = 'CLICK'")
      .select('COUNT(*)', 'total')
      .getRawOne();
    return Number(total ?? 0);
  }

  async countUniqueVisitors(userId: string): Promise<number> {
    const { total } = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere('a.isUnique = true')
      .andWhere("a.type = 'CLICK'")
      .select('COUNT(*)', 'total')
      .getRawOne();
    return Number(total ?? 0);
  }

  // --------------------------------------------------
  // Country stats
  // --------------------------------------------------
  async getTopCountries(userId: string, limit = 3) {
    const countryExpr = "COALESCE(NULLIF(a.country,'Unknown'),'Unknown')";
    const rows = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere("a.country IS NOT NULL AND a.country != 'Unknown'")
      .andWhere("a.type = 'CLICK'")
      .select(countryExpr, 'countryCode')
      .addSelect('COUNT(*)::int', 'total')
      .groupBy(countryExpr)
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      countryCode: r.countryCode,
      totalVisits: r.total,
    }));
  }

  // --------------------------------------------------
  // Segments
  // --------------------------------------------------
  async getListUrlsSegments(urlIds: string[]) {
    if (!urlIds.length) return {};

    const deviceExpr = "COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')";
    const osExpr = "COALESCE(NULLIF(a.os,'Unknown'),'Unknown')";
    const browserExpr = "COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')";
    const countryExpr = "COALESCE(NULLIF(a.country,'Unknown'),'Unknown')";
    const regionExpr = "COALESCE(NULLIF(a.region,'Unknown'),'Unknown')";
    const cityExpr = "COALESCE(NULLIF(a.city,'Unknown'),'Unknown')";
    const referrerExpr = "COALESCE(NULLIF(a.referrer,''),'Direct')";

    const rows = await this.createQueryBuilder('a')
      .select('"a"."urlId"', 'urlId')
      .addSelect(deviceExpr, 'device')
      .addSelect(osExpr, 'os')
      .addSelect(browserExpr, 'browser')
      .addSelect(countryExpr, 'countryCode')
      .addSelect(regionExpr, 'region')
      .addSelect(cityExpr, 'city')
      .addSelect(referrerExpr, 'referrer')
      .addSelect('COUNT(*)::int', 'total')
      .addSelect('COUNT(*) FILTER (WHERE a.isUnique = true)::int', 'unique')
      .where('a.urlId IN (:...urlIds)', { urlIds })
      .andWhere("a.type = 'CLICK'")
      .groupBy('"a"."urlId"')
      .addGroupBy(deviceExpr)
      .addGroupBy(osExpr)
      .addGroupBy(browserExpr)
      .addGroupBy(countryExpr)
      .addGroupBy(regionExpr)
      .addGroupBy(cityExpr)
      .addGroupBy(referrerExpr)
      .getRawMany();

    return AnalyticUtil.reduceByUrl(rows);
  }

  async getGlobalSegments(userId: string) {
    const deviceExpr = "COALESCE(NULLIF(a.deviceType,'Unknown'),'Unknown')";
    const osExpr = "COALESCE(NULLIF(a.os,'Unknown'),'Unknown')";
    const browserExpr = "COALESCE(NULLIF(a.browser,'Unknown'),'Unknown')";
    const countryExpr = "COALESCE(NULLIF(a.country,'Unknown'),'Unknown')";
    const regionExpr = "COALESCE(NULLIF(a.region,'Unknown'),'Unknown')";
    const cityExpr = "COALESCE(NULLIF(a.city,'Unknown'),'Unknown')";
    const referrerExpr = "COALESCE(NULLIF(a.referrer,''),'Direct')";

    const rows = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere("a.type = 'CLICK'")
      .select(deviceExpr, 'device')
      .addSelect(osExpr, 'os')
      .addSelect(browserExpr, 'browser')
      .addSelect(countryExpr, 'countryCode')
      .addSelect(regionExpr, 'region')
      .addSelect(cityExpr, 'city')
      .addSelect(referrerExpr, 'referrer')
      .addSelect('COUNT(*)::int', 'total')
      .addSelect('COUNT(*) FILTER (WHERE a.isUnique = true)::int', 'unique')
      .groupBy(deviceExpr)
      .addGroupBy(osExpr)
      .addGroupBy(browserExpr)
      .addGroupBy(countryExpr)
      .addGroupBy(regionExpr)
      .addGroupBy(cityExpr)
      .addGroupBy(referrerExpr)
      .getRawMany();

    return AnalyticUtil.reduceRows(rows);
  }

  // --------------------------------------------------
  // URL stats
  // --------------------------------------------------
  async getTopUrls(userId: string, limit = 3) {
    const rows = await this.getUrlAggregates(userId, {
      limit,
      orderByTotal: true,
    });
    if (!rows.length) return [];

    const urls = await this.findManyUrls(rows.map((r) => r.urlId));
    const segments = await this.getListUrlsSegments(rows.map((r) => r.urlId));

    return rows.map((r) => ({
      url: urls.find((u) => u.id === r.urlId)!,
      totalVisit: r.total,
      uniqueVisitors: r.unique,
      firstVisit: r.firstVisit,
      lastVisit: r.lastVisit,
      ...segments[r.urlId],
    }));
  }

  async getAllUrlStatsPaginated(userId: string, options: PaginatedOptions) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const rows = await this.getUrlStats(userId, { limit, offset });
    const { total } = await this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .where('url.userId = :userId', { userId })
      .andWhere("a.type = 'CLICK'")
      .select('COUNT(DISTINCT url.id)', 'total')
      .getRawOne();

    const urls = await this.findManyUrls(rows.map((r) => r.urlId));
    const segments = await this.getListUrlsSegments(rows.map((r) => r.urlId));

    const data = rows.map((r) => ({
      url: urls.find((u) => u.id === r.urlId)!,
      totalVisit: r.total,
      uniqueVisitors: r.unique,
      firstVisit: r.firstVisit,
      lastVisit: r.lastVisit,
      ...segments[r.urlId],
    }));

    return paginatedResult<UrlAnalyticStat>(data, Number(total ?? 0), options);
  }

  async getUrlStatsById(
    userId: string,
    urlId: string,
  ): Promise<UrlAnalyticStatDto | null> {
    const [row] = await this.getUrlAggregates(userId, { urlId });
    if (!row) return null;

    const url = await this.findOneUrl(row.urlId);
    const segments = await this.getListUrlsSegments([row.urlId]);

    return {
      url,
      totalVisit: row.total,
      uniqueVisitors: row.unique,
      firstVisit: row.firstVisit,
      lastVisit: row.lastVisit,
      ...segments[row.urlId],
    };
  }

  // --------------------------------------------------
  // Timeline
  // --------------------------------------------------
  async getAllUrlTimeline(userId: string, options: TimelineQueryDto = {}) {
    return this.buildTimeline(
      (qb) => qb.where('url.userId = :userId', { userId }),
      options,
    );
  }

  async getUrlTimelineById(
    userId: string,
    urlId: string,
    options: TimelineQueryDto = {},
  ) {
    return this.buildTimeline(
      (qb) =>
        qb
          .where('url.userId = :userId', { userId })
          .andWhere('url.id = :urlId', { urlId }),
      options,
    );
  }

  // --------------------------------------------------
  // Logs
  // --------------------------------------------------
  async getAllUrlLogs(
    userId: string,
    options: UrlLogsQueryDto,
    paginate: PaginatedOptions,
  ) {
    return this.getLogs(
      (qb) => qb.where('url.userId = :userId', { userId }),
      options,
      paginate,
    );
  }

  async getUrlLogsById(
    userId: string,
    urlId: string,
    options: UrlLogsQueryDto,
    paginate: PaginatedOptions,
  ) {
    return this.getLogs(
      (qb) =>
        qb
          .where('url.userId = :userId', { userId })
          .andWhere('url.id = :urlId', { urlId }),
      options,
      paginate,
    );
  }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
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
      .andWhere("a.type = 'CLICK'")
      .select('url.id', 'urlId')
      .addSelect('COUNT(*)::int', 'total')
      .addSelect('COUNT(*) FILTER (WHERE a.isUnique = true)::int', 'unique')
      .addSelect('MIN(a.createdAt)', 'firstVisit')
      .addSelect('MAX(a.createdAt)', 'lastVisit')
      .groupBy('url.id');

    if (options?.urlId)
      qb.andWhere('url.id = :urlId', { urlId: options.urlId });
    if (options?.orderByTotal) qb.orderBy('total', 'DESC');
    if (options?.limit) qb.limit(options.limit);
    if (options?.offset) qb.offset(options.offset);

    return qb.getRawMany();
  }

  private async getUrlStats(
    userId: string,
    options?: { limit?: number; offset?: number },
  ) {
    return this.getUrlAggregates(userId, options);
  }

  private async buildTimeline(
    where: (qb: any) => any,
    options: TimelineQueryDto,
  ) {
    const to = options.to ?? new Date();
    const from =
      options.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    const interval = options.interval ?? 'day';

    const qb = this.createQueryBuilder('a')
      .leftJoin('a.url', 'url')
      .select(`DATE_TRUNC('${interval}', a.createdAt)`, 'timestamp')
      .addSelect('COUNT(*)::int', 'totalVisits')
      .addSelect(
        'COUNT(*) FILTER (WHERE a.isUnique = true)::int',
        'uniqueVisits',
      )
      .andWhere("a.type = 'CLICK'")
      .andWhere('a.createdAt BETWEEN :from AND :to', { from, to });

    where(qb);

    const rows = await qb
      .groupBy('timestamp')
      .orderBy('timestamp', 'ASC')
      .getRawMany();
    return rows;
  }

  private async getLogs(
    where: (qb: any) => any,
    options: UrlLogsQueryDto,
    paginate: PaginatedOptions,
  ) {
    const to = options.to ?? new Date();
    const from =
      options.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    const qb = this.createQueryBuilder('a')
      .leftJoinAndSelect('a.url', 'url')
      .leftJoinAndSelect('a.channels', 'channels')
      .andWhere("a.type = 'CLICK'")
      .andWhere('a.createdAt BETWEEN :from AND :to', { from, to })
      .orderBy('a.createdAt', 'DESC')
      .skip(((paginate.page ?? 1) - 1) * (paginate.limit ?? 10))
      .take(paginate.limit ?? 10);

    where(qb);

    const [rows, total] = await qb.getManyAndCount();
    return paginatedResult(rows, total, paginate);
  }

  private async findManyUrls(urlIds: string[]): Promise<Url[]> {
    return this.dataSource.getRepository(Url).find({
      where: { id: In(urlIds) },
      relations: ['channels'],
    });
  }

  private async findOneUrl(id: string): Promise<Url> {
    return this.dataSource.getRepository(Url).findOneOrFail({
      where: { id },
      relations: ['channels'],
    });
  }
}
