import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { Channel } from '../entities/channel.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(private readonly dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }
}
