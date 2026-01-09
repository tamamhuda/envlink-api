import { DynamicModule, Logger, Module } from '@nestjs/common';
import { S3Service } from './aws/s3.service';
import { MailService } from './mail/mail.service';
import { XenditInitializeService } from './integrations/xendit/xendit-initialize.service';
import { XenditService } from './integrations/xendit/xendit.service';
import { XenditUtil } from './integrations/xendit/xendit.util';
import LoggerService from './logger/logger.service';
import { CacheService } from './cache/cache.service';
import { CacheHealthIndicator } from './cache/cache-health.indicator';
import CatchEverythingFilter from './filters/catch-everything.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { GoodBotsService } from './integrations/good-bot.service';
import { GoogleClientService } from './integrations/google-client.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { InvalidateCacheInterceptor } from './interceptors/invalidate-cache.interceptor';
import LoggingInterceptor from './interceptors/logging.interceptor';
import { SnakeCaseTransformInterceptor } from './interceptors/snake-case-transform.interceptor';
import { ThrottleInterceptor } from './interceptors/throttle.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { UrlAnalyticInterceptor } from './interceptors/url-analytic.interceptor';
import { ClientIdentityService } from './internal-services/request/client-identity.service';
import { IpService } from './internal-services/request/ip.service';
import { ThrottlePlanGuard } from './internal-services/throttle/guards/throttle-plan.guard';
import { ThrottleScopeGuard } from './internal-services/throttle/guards/throttle-scope.guard';
import { ThrottleService } from './internal-services/throttle/throttle.service';
import { ThrottlePolicyResolver } from './internal-services/throttle/throttle-policy.resolver';
import { ThrottleGuard } from './internal-services/throttle/guards/throttle.guard';

@Module({
  providers: [
    // aws
    S3Service,

    // mail
    MailService,

    // cache
    CacheService,
    CacheHealthIndicator,

    // integrations
    XenditInitializeService,
    XenditService,
    XenditUtil,
    GoodBotsService,
    GoogleClientService,

    // filters
    CatchEverythingFilter,
    HttpExceptionFilter,

    // interceptors
    CacheInterceptor,
    InvalidateCacheInterceptor,
    LoggingInterceptor,
    SnakeCaseTransformInterceptor,
    ThrottleInterceptor,
    TransformInterceptor,
    UrlAnalyticInterceptor,

    // internal services
    ClientIdentityService,
    IpService,

    ThrottleGuard,
    ThrottlePlanGuard,
    ThrottleScopeGuard,
    ThrottlePolicyResolver,
    ThrottleService,

    // loger
    LoggerService,
    Logger,
  ],

  exports: [
    // aws
    S3Service,

    // mail
    MailService,

    // cache
    CacheService,
    CacheHealthIndicator,

    // integrations
    XenditInitializeService,
    XenditService,
    XenditUtil,
    GoodBotsService,
    GoogleClientService,

    // filters
    CatchEverythingFilter,
    HttpExceptionFilter,

    // interceptors
    CacheInterceptor,
    InvalidateCacheInterceptor,
    LoggingInterceptor,
    SnakeCaseTransformInterceptor,
    ThrottleInterceptor,
    TransformInterceptor,
    UrlAnalyticInterceptor,

    // internal services
    ClientIdentityService,
    IpService,

    ThrottleGuard,
    ThrottlePlanGuard,
    ThrottleScopeGuard,
    ThrottlePolicyResolver,
    ThrottleService,

    // loger
    LoggerService,
    Logger,
  ],
})
export class InfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: InfrastructureModule,
      global: true,
    };
  }
}
