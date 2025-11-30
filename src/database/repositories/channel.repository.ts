import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { Channel } from '../entities/channel.entity';
import { DataSource, In } from 'typeorm';
import {
  PaginatedOptions,
  PaginatedResult,
} from 'src/common/interfaces/paginated.interface';
import { paginatedResult } from 'src/common/utils/paginate.util';
import { Url } from '../entities/url.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }

  async findById(userId: string, id: string): Promise<Channel | null> {
    return await this.findOne({
      where: { id, user: { id } },
      relations: ['user'],
    });
  }

  async findAll(userId: string) {
    return await this.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async createOne(
    userId: string,
    data: Partial<Channel>,
  ): Promise<[Channel | null, string | null]> {
    const user = await this.manager
      .getRepository(User)
      .findOneBy({ id: userId });
    if (!user) return [null, 'User not found'];

    const channel = this.create({ ...data, user });
    const savedChannel = await this.save(channel);
    return [savedChannel, null];
  }

  async updateOne(data: Partial<Channel>, channel: Channel) {
    const updated = this.merge(channel, data);
    return await this.save(updated);
  }

  async deleteOne(channel: Channel) {
    await this.remove(channel);
  }

  async findAllItemsById(
    userId: string,
    id: string,
    options: PaginatedOptions,
  ): Promise<PaginatedResult<Url>> {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const qb = this.manager
      .getRepository(Url)
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.channel', 'channel')
      .leftJoinAndSelect('channel.user', 'user')
      .where('channel.id = :id', { id })
      .andWhere('channel.user.id = :userId', { userId })
      .skip(offset)
      .take(limit)
      .orderBy('items.createdAt', 'DESC');

    const [rows, totalItems] = await qb.getManyAndCount();

    return paginatedResult(rows, totalItems, options);
  }

  async addItems(channel: Channel, itemsIds: string[]) {
    const items = await this.manager.getRepository(Url).find({
      where: { id: In(itemsIds) },
      relations: ['channel', 'channel.user'],
    });
    channel.urls = [...channel.urls, ...items];
    return await this.save(channel);
  }
}
