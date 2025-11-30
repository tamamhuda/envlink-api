import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Channel } from 'src/database/entities/channel.entity';
import { ChannelRepository } from 'src/database/repositories/channel.repository';
import { UserRepository } from 'src/database/repositories/user.repository';
import { CreateChannelBodyDto } from './dto/create.dto';
import { ChannelDto } from './dto/channel.dto';
import { UpdateChannelBodyDto } from './dto/update.dto';
import { PaginatedQuery } from 'src/common/dto/paginated.dto';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { ChannelItemsPaginatedDto } from './dto/items.dto';
import { AddItemsBodyDto } from './dto/add-items.dto';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly urlResolver: UrlGeneratorService,
  ) {}

  async getById(userId: string, id: string): Promise<Channel> {
    const channel = await this.channelRepository.findById(userId, id);
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async getAll(userId: string): Promise<ChannelDto[]> {
    return await this.channelRepository.findAll(userId);
  }

  async create(
    userId: string,
    body: CreateChannelBodyDto,
  ): Promise<ChannelDto> {
    const [channel, errMessage] = await this.channelRepository.createOne(
      userId,
      body,
    );
    if (!channel || errMessage) throw new BadRequestException(errMessage);
    return channel;
  }

  async update(userId: string, id: string, body: UpdateChannelBodyDto) {
    const channel = await this.getById(userId, id);
    return await this.channelRepository.updateOne(body, channel);
  }

  async delete(userId: string, id: string) {
    const channel = await this.getById(userId, id);
    return await this.channelRepository.deleteOne(channel);
  }

  async getAllItems(
    userId: string,
    id: string,
    pagination: PaginatedQuery,
  ): Promise<ChannelItemsPaginatedDto> {
    const url = this.urlResolver.generateUrlFromPath({
      relativePath: `channel/${id}/items`,
    });

    const options = {
      ...pagination,
      url,
    };
    return await this.channelRepository.findAllItemsById(userId, id, options);
  }

  async addItems(userId: string, id: string, body: AddItemsBodyDto) {
    const { itemsIds } = body;
    const channel = await this.getById(userId, id);
    await this.channelRepository.addItems(channel, itemsIds);
    return 'All items added successfully';
  }
}
