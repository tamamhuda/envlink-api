import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "node:process";
import {GlobalValidationPipe} from "./common/global-validation.pipe";
import LoggerService from "./common/logger/logger.service";
import {WinstonModule} from "nest-winston";
import {winstonLogger} from "./config/winston.logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger
    })
  });

  app.useGlobalPipes(new GlobalValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))

  await app.listen(process.env.PORT ?? 3000);

  const logger = app.get(LoggerService);
  logger.info(`Server running as ${process.env.NODE_ENV} on Port ${process.env.PORT}`)

}

bootstrap();


