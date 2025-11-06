import { Global, Logger, Module } from '@nestjs/common';
import { IpUtil } from './utils/ip.util';
import { AwsS3Util } from './utils/aws-s3.util';
import { JwtUtil } from './utils/jwt.util';
import { MailUtil } from './utils/mail.util';
import CatchEverythingFilter from './filters/catch-everything.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { InvalidateCacheInterceptor } from './interceptors/invalidate-cache.interceptor';
import LoggingInterceptor from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { UrlAnalyticInterceptor } from './interceptors/url-analytic.interceptor';
import LoggerService from './logger/logger.service';
import { CacheService } from './cache/cache.service';
import { CacheHealthIndicator } from './cache/cache-health.indicator';
import { ThrottleInterceptor } from './interceptors/throttle.interceptor';

import { ThrottleService } from './throttle/throttle.service';
import { ThrottlePolicyResolver } from './throttle/throttle-policy.resolver';
import { ClientIdentityUtil } from './utils/client-identity.util';
import { ThrottleGuard } from './throttle/guards/throttle.guard';
import { ThrottlePlanGuard } from './throttle/guards/throttle-plan.guard';
import { ThrottleScopeGuard } from './throttle/guards/throttle-scope.guard';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { XenditService } from './xendit/xendit.service';
import { XenditUtil } from './utils/xendit.util';
import { TokenUtil } from './utils/token.util';
import { ClientUrlMiddleware } from './middlewares/client-url.middleware';
import { SnakeCaseResponseInterceptor } from './interceptors/snake-case-transform.interceptor';

@Global()
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    Logger,
    LoggerService,
    CacheService,
    CacheHealthIndicator,

    CatchEverythingFilter,
    HttpExceptionFilter,

    CacheInterceptor,
    InvalidateCacheInterceptor,
    LoggingInterceptor,
    TransformInterceptor,
    UrlAnalyticInterceptor,
    ThrottleInterceptor,
    SnakeCaseResponseInterceptor,

    ThrottleGuard,
    ThrottleService,
    ThrottlePolicyResolver,
    ThrottlePlanGuard,
    ThrottleGuard,
    ThrottleScopeGuard,

    IpUtil,
    AwsS3Util,
    JwtUtil,
    MailUtil,
    ClientIdentityUtil,
    XenditUtil,
    TokenUtil,

    XenditService,

    ClientUrlMiddleware,
  ],
  exports: [
    Logger,
    LoggerService,
    CacheService,
    CacheHealthIndicator,

    CatchEverythingFilter,
    HttpExceptionFilter,

    CacheInterceptor,
    InvalidateCacheInterceptor,
    LoggingInterceptor,
    TransformInterceptor,
    UrlAnalyticInterceptor,
    ThrottleInterceptor,
    SnakeCaseResponseInterceptor,

    ThrottleGuard,
    ThrottleService,
    ThrottlePolicyResolver,
    ThrottlePlanGuard,
    ThrottleGuard,
    ThrottleScopeGuard,

    IpUtil,
    AwsS3Util,
    JwtUtil,
    MailUtil,
    ClientIdentityUtil,
    XenditUtil,
    TokenUtil,

    XenditService,
    ClientUrlMiddleware,
  ],
})
export class CommonModule {}
