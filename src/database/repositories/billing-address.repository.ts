import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BillingAddress } from '../entities/billing-address.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BillingAddressRepository extends Repository<BillingAddress> {
  constructor(dataSource: DataSource) {
    super(BillingAddress, dataSource.createEntityManager());
  }

  async findByUserAndId(
    userId: string,
    id: string,
  ): Promise<BillingAddress | null> {
    return this.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
  }

  async findAllByUser(userId: string): Promise<BillingAddress[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async createOne(data: Partial<BillingAddress>): Promise<BillingAddress> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  async updateOne(
    existing: BillingAddress,
    data: Partial<BillingAddress>,
  ): Promise<BillingAddress> {
    const merge = this.merge(existing, data);
    return await this.save(merge);
  }
}
