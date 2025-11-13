import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsCallbackService } from './subscriptions-callback.service';
import { UserModule } from 'src/user/user.module';
import { SubscriptionsCyclesService } from './cycles/cycles.service';
import { SubscriptionsCyclesController } from './cycles/cycles.controller';
import { PublicSubscriptionPlansController } from './public/subscription-plans.controller';
import { SubscriptionsPlansService } from './plans/plans.service';

@Module({
  imports: [UserModule],
  controllers: [
    SubscriptionsController,
    PublicSubscriptionPlansController,
    SubscriptionsCyclesController,
  ],
  providers: [
    SubscriptionsService,
    SubscriptionsCyclesService,
    SubscriptionsCallbackService,
    SubscriptionsPlansService,
  ],
  exports: [
    SubscriptionsService,
    SubscriptionsCyclesService,
    SubscriptionsCallbackService,
    SubscriptionsPlansService,
  ],
})
export class SubscriptionsModule {}
