import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Analytic } from '../entities/analytic.entity';

@Injectable()
export class AnalyticRepository extends Repository<Analytic> {
  constructor(private readonly dataSource: DataSource) {
    super(Analytic, dataSource.createEntityManager());
  }
}
