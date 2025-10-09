import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Analytic } from '../entities/analytic.entity';

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
}
