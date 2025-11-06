import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findOneById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async findOneByExternalId(externalId: string): Promise<User | null> {
    return this.findOne({ where: { externalId } });
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    return this.findOne({ where: [{ email }, { username }] });
  }

  async findByEmailOrUsernameOptional(
    email?: string,
    username?: string,
  ): Promise<User | null> {
    const where: any[] = [];

    if (email) {
      where.push({ email });
    }

    if (username) {
      where.push({ username });
    }

    if (where.length === 0) {
      return null;
    }

    return this.findOne({ where });
  }

  async findByExternalId(externalId: string): Promise<User | null> {
    return this.findOne({
      where: { externalId: externalId },
      relations: ['activeSubscription', 'activeSubscription.plan'],
    });
  }

  async updateOne(user: User, updateUserDto: Partial<User>): Promise<User> {
    const updated = this.merge(user, updateUserDto);
    return this.save(updated);
  }
}
