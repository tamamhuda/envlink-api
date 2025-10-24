import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OkDto } from 'src/common/dto/response.dto';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';
import {
  PaymentMethodCallback,
  PaymentMethodData,
} from 'src/common/interfaces/xendit.interface';
import { PaymentMethod } from 'src/database/entities/payment-method.entity';
import { User } from 'src/database/entities/user.entity';
import { PaymentMethodRepository } from 'src/database/repositories/payment-method.repository';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  async createOrUpdatePaymentMethod(
    customerId: string,
    externalId: string,
    data: PaymentMethodData,
  ): Promise<PaymentMethod> {
    return this.paymentMethodRepository.manager.transaction(async (manager) => {
      const { reusability, status, description, failure_code, type, country } =
        data;
      const existingPaymentMethod = await manager.findOneBy(PaymentMethod, {
        externalId,
      });

      if (!existingPaymentMethod) {
        const user = await manager
          .findOneByOrFail(User, { externalId: customerId })
          .catch(() => {
            throw new NotFoundException('User not found');
          });

        const paymentMethod = manager.create(PaymentMethod, {
          externalId,
          user,
          customerId,
          type,
          reusability,
          status,
          country,
          description,
        });
        paymentMethod.assignPaymentMethodByType(type, data);

        return await manager.save(paymentMethod);
      }

      const paymentMethod = manager.merge(
        PaymentMethod,
        existingPaymentMethod,
        {
          externalId,
          type,
          customerId,
          reusability,
          status,
          failure_code,
          description,
        },
      );
      paymentMethod.assignPaymentMethodByType(type, data);

      return await manager.save(paymentMethod);
    });
  }

  async handlePaymentMethodCallback(
    body: PaymentMethodCallback,
  ): Promise<OkDto> {
    const { data } = body;
    if (!data) throw new BadRequestException('Invalid payment method data');

    const { customer_id, id } = data;

    if (
      ![
        PaymentMethodType.CARD,
        PaymentMethodType.EWALLET,
        PaymentMethodType.DIRECT_DEBIT,
      ].includes(data.type)
    ) {
      throw new BadRequestException('Invalid payment method type');
    }
    await this.createOrUpdatePaymentMethod(customer_id, id, data);
    return {
      message: 'OK',
    };
  }
}
