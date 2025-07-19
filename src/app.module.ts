import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {GlobalProviders} from "./common/providers/global.providers";
import LoggerService from "./common/logger/logger.service";
import {WinstonModule} from "nest-winston";
import {WinstonConfigService} from "./config/winston-config.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {getDatabaseConfig} from "./config/database.config";
import {RedisModule as NestRedisModule} from "@nestjs-modules/ioredis";
import {getRedisConfig} from "./config/redis.config";
import {RedisModule} from "./redis/redis.module";
import {CacheModule} from "@nestjs/cache-manager";
import {getCacheConfig} from "./config/cache.config";
import {envValidationSchema} from "./config/env.validation";
import {CacheInvalidateService} from "./common/cache/cache-invalidate.service";


@Module({
  imports: [

      // Environment setup for local, development and production
      ConfigModule.forRoot({
          isGlobal: true,
          validate: (env) =>  envValidationSchema.parse(env),
          envFilePath: [
          `.env.${process.env.NODE_ENV}`,
          `.env.development.local`,
          ],
          expandVariables: true,
      }),

      // TypeOrmModule with async config
      TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: getDatabaseConfig
      }),

      // Nest Redis Module with async config
      NestRedisModule.forRootAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: getRedisConfig
        },
        ),

      // Cache Manager with Redis as Cache Store
      CacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: getCacheConfig
      }),

      // JwtModule for access tokens


      // Winston Logger
      WinstonModule.forRootAsync({
          useClass: WinstonConfigService
      }),

    AccountModule,
    SessionModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    RedisModule
  ],

  controllers: [AppController],
  providers: [
      AppService,
      LoggerService,
      CacheInvalidateService,
      ...GlobalProviders,
  ],
    exports: [
        LoggerService,
        CacheInvalidateService
    ],
})
export class AppModule {}
