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
      where: { id, user: { id: userId } },
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

  async findAllPaginated(
    userId: string,
    options: PaginatedOptions,
    isStarred: boolean = false,
  ): Promise<PaginatedResult<Channel>> {
    const { page = 1, limit = 10 } = options;

    const qb = this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.user', 'user')
      .where('channel.user.id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('channel.createdAt', 'DESC');

    if (isStarred) {
      qb.andWhere('channel.isStarred = :isStarred', { isStarred });
    }

    const [rows, totalItems] = await qb.getManyAndCount();
    return paginatedResult(rows, totalItems, options);
  }
  async findAllItemsById(
    userId: string,
    channelId: string,
    options: PaginatedOptions,
  ) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const qb = this.manager
      .getRepository(Url)
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })
      .andWhere((sub) => {
        const sq = sub
          .subQuery()
          .select('uc.urlsId')
          .from('urls_channels_channels', 'uc')
          .where('uc.channelsId = :channelId')
          .getQuery();
        return `item.id IN (${sq})`;
      })
      .setParameter('channelId', channelId)
      .leftJoinAndSelect('item.channels', 'channel')
      .orderBy('item.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [rows, totalItems] = await qb.getManyAndCount();
    return paginatedResult(rows, totalItems, options);
  }

  async findManyByIds(userId: string, ids: string[]): Promise<Channel[]> {
    const qb = this.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.user', 'user')
      .where('channel.user.id = :userId', { userId })
      .andWhere('channel.id IN (:...ids)', { ids });

    return await qb.getMany();
  }

  async findOwnedChannels(userId: string, channelIds: string[]) {
    return this.find({
      where: { id: In(channelIds), user: { id: userId } },
    });
  }

  async findOwnedItems(userId: string, itemIds: string[]) {
    return this.manager.getRepository(Url).find({
      where: { id: In(itemIds), user: { id: userId } },
    });
  }

  async attachItemsToChannels(channelIds: string[], itemIds: string[]) {
    for (const channelId of channelIds) {
      // Fetch existing mapped URLs for this channel
      const existing = await this.createQueryBuilder()
        .select('uc."urlsId"', 'urlsId')
        .from('urls_channels_channels', 'uc')
        .where('uc."channelsId" = :channelId', { channelId })
        .andWhere('uc."urlsId" IN (:...itemIds)', { itemIds })
        .getRawMany();

      const existingItems = new Set(existing.map((r) => r.urlsId));

      // Only include missing relations
      const newItems = itemIds.filter((id) => !existingItems.has(id));
      if (newItems.length === 0) continue;

      await this.createQueryBuilder()
        .relation(Channel, 'urls')
        .of(channelId)
        .add(newItems);
    }
  }
}
