import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';

@Module({
  imports: [SubscriptionsModule, PaymentMethodsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
