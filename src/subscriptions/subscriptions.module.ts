import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsCyclesService } from './subscriptions-cycles.service';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';
import { SubscriptionsCallbackService } from './subscriptions-callback.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PaymentMethodsModule, UserModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsCyclesService,
    SubscriptionsCallbackService,
  ],
  exports: [
    SubscriptionsService,
    SubscriptionsCyclesService,
    SubscriptionsCallbackService,
  ],
})
export class SubscriptionsModule {}
