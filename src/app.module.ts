import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { SessionModule } from './sessions/session.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { ENV_PATH, envValidate } from './config/env.config';

import LoggingInterceptor from './infrastructure/interceptors/logging.interceptor';
import { HealthModule } from 'src/health/health.module';

import { UrlGeneratorModule } from 'nestjs-url-generator';
import { UrlsModule } from './urls/urls.module';
import { QueueModule } from './queue/queue.module';

import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { getCacheConfig, getRedisConfig } from './config/cache.config';

import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { TransactionsModule } from './transactions/transactions.module';
import { getSignedUrlConfig } from './config/signed-url.config';

import { AnalyticsModule } from './analytics/analytics.module';
import { BillingAddressModule } from './billing-address/billing-address.module';
import { OauthModule } from './oauth/oauth.module';
import { RedisClientModule } from '@quazex/nestjs-ioredis';
import { ChannelsModule } from './channels/channels.module';
import { CrawlerDetection } from './urls/middlewares/crawler-detection.middleware';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { SecurityModule } from './security/security.module';
import { SnakeCaseTransformInterceptor } from './infrastructure/interceptors/snake-case-transform.interceptor';
import { ClientUrlMiddleware } from './infrastructure/middlewares/client-url.middleware';
import CatchEverythingFilter from './infrastructure/filters/catch-everything.filter';
import { HttpExceptionFilter } from './infrastructure/filters/http-exception.filter';
import { InvalidateCacheInterceptor } from './infrastructure/interceptors/invalidate-cache.interceptor';
import { ThrottleInterceptor } from './infrastructure/interceptors/throttle.interceptor';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import { ThrottleGuard } from './infrastructure/internal-services/throttle/guards/throttle.guard';

@Module({
  imports: [
    // Environment setup for local, development and production
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidate,
      envFilePath: ENV_PATH,
      expandVariables: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // TypeOrmModule
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Url Generator Module
    UrlGeneratorModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getSignedUrlConfig,
    }),

    // Cache Module
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),

    // Redis Module
    RedisClientModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRedisConfig,
    }),

    AccountModule,
    SessionModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    HealthModule,
    UrlsModule,
    QueueModule,
    SubscriptionsModule,
    WebhooksModule,
    PaymentMethodsModule,
    TransactionsModule,
    AnalyticsModule,
    BillingAddressModule,
    OauthModule,
    ChannelsModule,
    InfrastructureModule.forRoot(),
    SecurityModule.forRoot(),
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // runs last
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // wraps everything
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor, // after invalidation
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SnakeCaseTransformInterceptor, // before serialization
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InvalidateCacheInterceptor, // after controller, before serialization
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // before controller
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ThrottleInterceptor, // before controller
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Then throttler guard (depends on req.user)
    {
      provide: APP_GUARD,
      useClass: ThrottleGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientUrlMiddleware).forRoutes('*');
    consumer.apply(CrawlerDetection).forRoutes({
      path: '/public/urls/r/:code',
      method: RequestMethod.ALL,
    });
  }
}
