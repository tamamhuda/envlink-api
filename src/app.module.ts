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
import {HttpExceptionFilter} from "./common/http-exception.filter";
import CatchEverythingFilter from "./common/catch-everything.filter";


@Module({
  imports: [

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


    AccountModule,
    SessionModule,
    AuthModule,
    UserModule,
    DatabaseModule],
  controllers: [AppController],
  providers: [
      AppService,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,

    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ],
})
export class AppModule {}
