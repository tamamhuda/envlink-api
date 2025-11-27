import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodStatus } from 'src/common/enums/payment-method-status.enum';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class PaymentMethodRepository extends Repository<PaymentMethod> {
  constructor(datasource: DataSource) {
    super(PaymentMethod, datasource.createEntityManager());
  }

  async updateOne(
    paymentMethod: PaymentMethod,
    data: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    const merge = this.merge(paymentMethod, data);
    return this.save(merge);
  }

  async findOneByUserAndId(
    userId: string,
    id: string,
  ): Promise<PaymentMethod | null> {
    return await this.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOneByUserAndExternalId(
    userId: string,
    externalId: string,
  ): Promise<PaymentMethod | null> {
    return await this.findOne({
      where: { externalId, user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOneByUserAndIdOrExternalId(
    userId: string,
    idOrExternalId: string,
  ): Promise<PaymentMethod | null> {
    const isUUID = isValidUUID(idOrExternalId);
    let where = isUUID
      ? { id: idOrExternalId, user: { id: userId } }
      : { externalId: idOrExternalId, user: { id: userId } };
    return await this.findOne({
      where,
      relations: ['user'],
    });
  }

  async findManyByUser(userId: string): Promise<PaymentMethod[]> {
    return await this.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { rank: 'ASC' },
    });
  }

  async findManyRecurringByUser(userId: string): Promise<PaymentMethod[]> {
    return await this.find({
      where: {
        user: { id: userId },
        isRecurring: true,
        status: PaymentMethodStatus.ACTIVE,
      },
      relations: ['user'],
      order: { rank: 'ASC' },
    });
  }

  async findOneByUserId(userId: string): Promise<PaymentMethod[]> {
    return await this.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
  async findOneByAccountIdentityHash(
    accountIdentityHash: string,
  ): Promise<PaymentMethod | null> {
    return await this.findOne({
      where: { accountIdentityHash },
      relations: ['user'],
    });
  }
}
