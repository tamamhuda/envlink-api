import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

import { ENV_PATH, envValidate } from './config/env.config';
import { LoggerModule } from './logger/logger.module';
import CatchEverythingFilter from './common/filters/catch-everything.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import LoggingInterceptor from './common/interceptors/logging.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { HealthModule } from 'src/health/health.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { InvalidateCacheInterceptor } from './common/interceptors/invalidate-cache.interceptor';
import { UrlGeneratorModule } from 'nestjs-url-generator';
import { getUrlGeneratorConfig } from './config/url-generator.config';
import { CacheModule } from './cache/cache.module';
import { UrlsModule } from './urls/urls.module';
import { QueueModule } from './queue/queue.module';
import { CommonModule } from './common/common.module';

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
      useFactory: getUrlGeneratorConfig,
    }),

    AccountModule,
    SessionModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    LoggerModule,
    HealthModule,
    CacheModule,
    UrlsModule,
    QueueModule,
    CommonModule,
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
      useClass: ZodSerializerInterceptor, // after invalidation
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // wraps everything
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InvalidateCacheInterceptor, // after controller, before serialization
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // before controller
    },
  ],
})
export class AppModule {}
