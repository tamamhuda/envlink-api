import { Injectable } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import {
  Between,
  DataSource,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { TransactionStatus } from 'src/common/enums/transaction-status.enum';

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  private readonly relations = [
    'user',
    'subscription',
    'subscriptionCycle',
    'paymentMethod',
  ];
  constructor(dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  findAllByUserId(userId: string): Promise<Transaction[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['user', 'subscription', 'subscriptionCycle'],
    });
  }

  async findAllByUserIdWithFilters(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      status?: TransactionStatus[];
    },
  ): Promise<Transaction[]> {
    const { startDate, endDate, status } = filters;

    const where: any = {
      user: { id: userId },
    };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    if (status && status.length > 0) {
      where.status = In(status);
    }

    return this.find({
      where,
      relations: this.relations,
      order: { createdAt: 'DESC' },
    });
  }

  findOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Transaction | null> {
    return this.findOne({
      where: { id, user: { id: userId } },
      relations: this.relations,
    });
  }
}
