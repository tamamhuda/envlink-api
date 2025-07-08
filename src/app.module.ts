import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import {ConfigModule} from "@nestjs/config";
import {APP_FILTER} from "@nestjs/core";
import {HttpExceptionFilter} from "./common/filters/http-exception.filter";
import CatchEverythingFilter from "./common/filters/catch-everything.filter";
import {GlobalProviders} from "./common/providers/global.providers";
import LoggerService from "./common/logger/logger.service";
import {WinstonModule} from "nest-winston";
import {WinstonConfigService} from "./config/winston-config.service";


@Module({
  imports: [
    // Environment setup for local, development and production
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: [
          `.env.${process.env.NODE_ENV}`,
          `.env.development.local`,
        ],
        expandVariables: true,
      }),

    // Database module using TypeOrmModule with async config


    // JwtModule for access tokens


    // Winston Logger
      WinstonModule.forRootAsync({
          useClass: WinstonConfigService
      }),

    AccountModule,
    SessionModule,
    AuthModule,
    UserModule,
    DatabaseModule],
  controllers: [AppController],
  providers: [
      AppService,
      ...GlobalProviders,
      LoggerService

  ],
    exports: [LoggerService]
})
export class AppModule {}
