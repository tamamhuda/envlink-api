import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "node:process";
import {ValidationPipe} from "@nestjs/common";
import {GlobalValidationPipe} from "./common/filters/global-validation.pipe";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new GlobalValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))

  await app.listen(process.env.PORT ?? 3000);


  console.log(`Server running as ${process.env.NODE_ENV} on Port ${process.env.PORT}`);
  console.log(`Database URL ${process.env.DATABASE_URL}`);
}

bootstrap();


