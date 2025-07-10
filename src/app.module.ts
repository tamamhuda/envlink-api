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

    // TypeOrmModule with async config
      TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: getDatabaseConfig
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
