import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'src/database/entities/payment-method.entity';
import { PaymentMethodDto } from '../dto/payment-method.dto';
import { PaymentMethodType } from 'src/common/enums/payment-method-type.enum';

@Injectable()
export class PaymentMethodsMapper {
  mapToDto(paymentMethod: PaymentMethod): PaymentMethodDto {
    const { user, type } = paymentMethod;
    const card = type === PaymentMethodType.CARD ? { ...paymentMethod } : null;
    const ewallet =
      type === PaymentMethodType.EWALLET ? { ...paymentMethod } : null;
    const directDebit =
      type === PaymentMethodType.DIRECT_DEBIT ? { ...paymentMethod } : null;

    return {
      userId: user.id,
      ...paymentMethod,
      card,
      ewallet,
      directDebit,
    };
  }
}
