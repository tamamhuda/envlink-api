import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';

@Module({
  imports: [SubscriptionsModule, PaymentMethodsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, SubscriptionsService, PaymentMethodsService],
})
export class WebhooksModule {}
