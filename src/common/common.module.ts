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

@Global()
@Module({
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

    IpUtil,
    AwsS3Util,
    JwtUtil,
    MailUtil,
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

    IpUtil,
    AwsS3Util,
    JwtUtil,
    MailUtil,
  ],
})
export class CommonModule {}
