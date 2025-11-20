import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AccountRepository } from './repositories/account.repository';
import { SessionRepository } from './repositories/session.repository';
import { UrlRepository } from './repositories/url.repository';
import { AnalyticRepository } from './repositories/analytic.repository';
import { ChannelRepository } from './repositories/channel.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { PlanRepository } from './repositories/plan.reposiotry';
import { PlanSeeder } from './seeders/plan.seeder';
import { PlanUsageRepository } from './repositories/plan-usage-history.repository';
import { PaymentMethodRepository } from './repositories/payment-method.repository';
import { SubscriptionCycleRepository } from './repositories/subscription-cycle.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { SubscriptionHistoryRepository } from './repositories/subscription-history.repository';
import { BillingAddressRepository } from './repositories/billing-address.repository';

@Global()
@Module({
  providers: [
    UserRepository,
    AccountRepository,
    SessionRepository,
    UrlRepository,
    AnalyticRepository,
    ChannelRepository,
    SubscriptionRepository,
    PlanUsageRepository,
    PlanRepository,
    PlanSeeder,
    PaymentMethodRepository,
    SubscriptionCycleRepository,
    TransactionRepository,
    SubscriptionHistoryRepository,
    BillingAddressRepository,
  ],
  exports: [
    UserRepository,
    AccountRepository,
    SessionRepository,
    UrlRepository,
    AnalyticRepository,
    ChannelRepository,
    SubscriptionRepository,
    PlanUsageRepository,
    PlanRepository,
    PlanSeeder,
    PaymentMethodRepository,
    SubscriptionCycleRepository,
    TransactionRepository,
    SubscriptionHistoryRepository,
    BillingAddressRepository,
  ],
})
export class DatabaseModule {}
