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

@Global()
@Module({
  providers: [
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
    Logger,
    LoggerService,
  ],
  exports: [
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
    Logger,
    LoggerService,
  ],
})
export class CommonModule {}
