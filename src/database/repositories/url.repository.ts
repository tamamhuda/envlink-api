import { Injectable } from '@nestjs/common';
import { Url } from '../entities/url.entity';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { PaginatedOptions } from 'src/common/interfaces/paginated.interface';
import { paginatedResult } from 'src/common/utils/paginate.util';

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

  async createOne(data: Partial<Url>): Promise<Url> {
    const url = this.create(data);
    return await this.save(url);
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

  async findUrlsPaginated(userId: string, options: PaginatedOptions) {
    const { page = 1, limit = 10 } = options;

    const qb = this.createQueryBuilder('url')
      .leftJoinAndSelect('url.channels', 'channels')
      .where('url.userId  = :userId', { userId })
      .orderBy('url.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, totalItems] = await qb.getManyAndCount();

    return paginatedResult<Url>(rows, totalItems, options);
  }

  async updateOne(url: Url, data: Partial<Url>): Promise<Url> {
    const merge = this.merge(url, data);
    return await this.save(merge);
  }
}
