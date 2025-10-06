import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import Session from '../entities/session.entity';

@Injectable()
export class SessionRepository extends Repository<Session> {
  constructor(dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }

  async findOneById(id: string): Promise<Session | null> {
    return this.findOne({ where: { id }, relations: ['user', 'account'] });
  }

  async updateOne(instance: Session, data: Partial<Session>): Promise<Session> {
    const session = this.merge(instance, data);
    return await this.save(session);
  }

  async updateManyByUserId(
    userId: string,
    data: Partial<Session>,
    isRevoked?: boolean,
  ) {
    const qb = this.createQueryBuilder()
      .update(Session)
      .set(data)
      .where('userId = :userId', { userId });

    if (typeof isRevoked !== 'undefined') {
      qb.andWhere('isRevoked = :isRevoked', { isRevoked });
    }

    return qb.execute();
  }

  async findManyByUserId(
    userId: string,
    condition?: FindOptionsWhere<Session>,
  ): Promise<Session[]> {
    return this.find({
      where: { user: { id: userId }, ...condition },
      relations: ['user', 'account'],
    });
  }
}
