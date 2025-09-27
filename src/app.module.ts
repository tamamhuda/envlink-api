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
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { getRedisConfig } from './config/redis.config';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import { getCacheConfig } from './config/cache.config';
import { ENV_PATH, envValidate } from './config/env.config';
import { CacheInvalidateService } from './common/cache/cache-invalidate.service';
import { LoggerModule } from './logger/logger.module';
import CatchEverythingFilter from './common/filters/catch-everything.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import LoggingInterceptor from './common/interceptors/logging.interceptor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { HealthModule } from 'src/health/health.module';

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

    // Nest Redis Module
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRedisConfig,
    }),

    // Cache Manager with Redis as Cache Store
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),

    // JwtModule for access tokens

    AccountModule,
    SessionModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    RedisModule,
    LoggerModule,
    HealthModule,
  ],

  providers: [
    CacheInvalidateService,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
  exports: [CacheInvalidateService],
})
export class AppModule {}
