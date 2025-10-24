import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Module({
  imports: [SubscriptionsModule],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, SubscriptionsService],
})
export class PaymentMethodsModule {}
