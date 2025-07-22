import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "node:process";
import {GlobalValidationPipe} from "./common/pipes/global-validation.pipe";
import LoggerService from "./common/logger/logger.service";
import {WinstonModule} from "nest-winston";
import {winstonLogger} from "./config/winston.logger";
import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./config/env.validation";
import {getSwaggerDocumentConfig} from "./config/swagger.config";
import {SwaggerModule} from "@nestjs/swagger";
import {ZodValidationPipe} from "./common/pipes/zod-validation.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger
    })
  });

  app.useGlobalPipes(new ZodValidationPipe())

  const config = app.get(ConfigService<EnvVars>)

  const documentConfig = await getSwaggerDocumentConfig(config);
  const documentFactory = () => SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(config.get('PORT', {infer: true}) ?? 3000);

  app.setGlobalPrefix(`api`)

  const logger = app.get(LoggerService);
  logger.info(`Server running as ${config.get('NODE_ENV', {infer: true})} on Port ${config.get('PORT', {infer: true})}`);

}

bootstrap();


