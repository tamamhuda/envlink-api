import { Injectable } from '@nestjs/common';
import { Url } from '../entities/url.entity';
import { DataSource, FindOptionsWhere, In } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { PaginatedOptions } from 'src/common/interfaces/paginated.interface';
import { paginatedResult } from 'src/common/utils/paginate.util';
import { FilterQuery, FilterQueryDto } from 'src/urls/dto/filter-query.dto';

@Injectable()
export class UrlRepository extends Repository<Url> {
  constructor(private readonly dataSource: DataSource) {
    super(Url, dataSource.createEntityManager());
  }

  findOneById(id: string): Promise<Url | null> {
    return this.findOne({ where: { id }, relations: ['channels', 'user'] });
  }

  findOneByCode(code: string): Promise<Url | null> {
    return this.findOne({ where: { code }, relations: ['channels', 'user'] });
  }

  findOneByAlias(alias: string): Promise<Url | null> {
    return this.findOne({ where: { alias }, relations: ['channels', 'user'] });
  }

  async createOne(data: Partial<Url>): Promise<Url> {
    const url = this.create(data);
    return await this.save(url);
  }

  async findOneBySlug(slug: string): Promise<Url | null> {
    return this.createQueryBuilder('url')
      .where('url.code = :slug OR url.alias = :slug', { slug })
      .leftJoinAndSelect('url.user', 'user')
      .leftJoinAndSelect('user.channels', 'channels')
      .getOne();
  }

  async findOneByIdOrCode(id?: string, code?: string): Promise<Url | null> {
    const where: FindOptionsWhere<Url>[] = [];

    if (id) where.push({ id });

    if (code) where.push({ code });

    if (where.length === 0) return null;

    return this.findOne({ where, relations: ['channels', 'user'] });
  }

  async findManyByUserId(
    userId: string,
    condition?: FindOptionsWhere<Url>,
  ): Promise<Url[]> {
    return this.find({
      where: { user: { id: userId }, ...condition },
    });
  }

  async findUrlsPaginated(
    userId: string,
    options: PaginatedOptions,
    filter: FilterQuery,
  ) {
    const { page = 1, limit = 10 } = options;
    const { archived, expired = false, privated, q } = filter;

    const qb = this.createQueryBuilder('url')
      .leftJoinAndSelect('url.channels', 'channels')
      .where('url.userId = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit);

    // Base filter
    if (privated !== undefined) {
      qb.andWhere('url.isPrivate = :privated', { privated });
    }

    if (archived !== undefined) {
      qb.andWhere('url.isArchived = :archived', { archived });

      // override global ordering for archived items
      if (archived) {
        qb.orderBy('url.archivedAt', 'DESC').addOrderBy(
          'url.createdAt',
          'DESC',
        );
      }
    } else {
      // normal mode
      qb.orderBy('url.createdAt', 'DESC');
    }

    if (expired) {
      qb.andWhere(`url.expiresAt IS NOT NULL AND url.expiresAt < :today`, {
        today: new Date(),
      });
    }

    // Search
    if (q) {
      qb.andWhere(
        `
        (
          url.code ILIKE :q
          OR url.alias ILIKE :q
          OR url.description ILIKE :q
          OR url.originalUrl ILIKE :q
          OR url.metadata->>'title' ILIKE :q
          OR url.metadata->>'description' ILIKE :q
        )
        `,
        { q: `%${q}%` },
      );
    }

    const [rows, totalItems] = await qb.getManyAndCount();

    return paginatedResult<Url>(rows, totalItems, options);
  }

  async updateOne(url: Url, data: Partial<Url>): Promise<Url> {
    const merge = this.merge(url, data);
    return await this.save(merge);
  }

  async updateMany(
    userId: string,
    itemIds: string[],
    data: Partial<Url>,
  ): Promise<void> {
    console.log('Updating many items with data:', data);
    await this.update(
      {
        user: { id: userId },
        id: In(itemIds),
      },
      data,
    );
  }

  async deleteMany(userId: string, itemIds: string[]) {
    return await this.delete({
      user: { id: userId },
      id: In(itemIds),
    });
  }
}
