import { cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import LoggerService from './logger/logger.service';
import { WinstonModule } from 'nest-winston';
import { instance } from './logger/logger.instance';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env.config';
import { getSwaggerDocumentConfig } from './config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PlanSeeder } from './database/seeders/plan.seeder';

async function bootstrap() {
  const isWorker = process.env.WORKER === 'true';

  if (isWorker) {
    // DON'T start app.listen()
    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: WinstonModule.createLogger({ instance }),
    });
    const logger = appContext.get(LoggerService);
    logger.log(
      `Worker process started: ${process.env.WORKER_NAME || 'default'}`,
    );
    return;
  }

  // HTTP server context
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({ instance }),
  });

  app.setGlobalPrefix('api/v1');
  app.set('trust proxy', true);

  const config = app.get(ConfigService<Env>);
  const PORT = config.get<Env['PORT']>('PORT') || 3000;
  const NODE_ENV = config.get<Env['NODE_ENV']>('NODE_ENV') || 'local';

  // Swagger / OpenAPI
  const swaggerConfig = getSwaggerDocumentConfig(config);
  const openApiDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, cleanupOpenApiDoc(openApiDoc));

  const logger = app.get(LoggerService);
  const seeder = app.get(PlanSeeder);
  await seeder.seed();

  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT} with env ${NODE_ENV}`);
  });
}

bootstrap();
