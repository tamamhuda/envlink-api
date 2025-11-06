import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsMapper } from './mapper/payment-methods.mapper';
import { UserModule } from 'src/user/user.module';
import { PublicPaymentMethodsController } from './public/payment-methods.controller';

@Module({
  imports: [UserModule],
  controllers: [PaymentMethodsController, PublicPaymentMethodsController],
  providers: [PaymentMethodsService, PaymentMethodsMapper],
  exports: [PaymentMethodsService, PaymentMethodsMapper],
})
export class PaymentMethodsModule {}
