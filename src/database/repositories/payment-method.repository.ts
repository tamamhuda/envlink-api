import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodRepository extends Repository<PaymentMethod> {
  constructor(datasource: DataSource) {
    super(PaymentMethod, datasource.createEntityManager());
  }
}
