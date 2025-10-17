import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
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
import CatchEverythingFilter from './common/filters/catch-everything.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import LoggingInterceptor from './common/interceptors/logging.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { HealthModule } from 'src/health/health.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { InvalidateCacheInterceptor } from './common/interceptors/invalidate-cache.interceptor';
import { UrlGeneratorModule } from 'nestjs-url-generator';
import { getUrlGeneratorConfig } from './config/url-generator.config';
import { UrlsModule } from './urls/urls.module';
import { QueueModule } from './queue/queue.module';
import { CommonModule } from './common/common.module';
import { CacheModule } from '@nestjs/cache-manager';
import { getCacheConfig, getRedisConfig } from './config/cache.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ThrottleInterceptor } from './common/interceptors/throttle.interceptor';
import { ThrottleGuard } from './common/throttle/guards/throttle.guard';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

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

    // Cache Module
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),

    // Redis Module
    RedisModule.forRootAsync({
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
    CommonModule,
    SubscriptionsModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ThrottleInterceptor, // before controller
    },

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2️⃣ Then throttler guard (depends on req.user)
    {
      provide: APP_GUARD,
      useClass: ThrottleGuard,
    },
  ],
})
export class AppModule {}
