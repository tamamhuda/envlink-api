import { cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { instance as loggerInstance } from './common/logger/logger.instance';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env.config';
import { getSwaggerDocumentConfig } from './config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PlanSeeder } from './database/seeders/plan.seeder';
import LoggerService from './common/logger/logger.service';
import { join } from 'path';
import * as hbs from 'hbs';
import * as yaml from 'yaml';

async function bootstrap() {
  const isWorker = process.env.WORKER === 'true';

  if (isWorker) {
    // DON'T start app.listen()
    const appContext = await NestFactory.createApplicationContext(AppModule, {
      logger: WinstonModule.createLogger({ instance: loggerInstance }),
    });
    const logger = appContext.get(LoggerService);
    logger.log(
      `Worker process started: ${process.env.WORKER_NAME || 'default'}`,
    );
    return;
  }

  // HTTP server context
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({ instance: loggerInstance }),
  });

  const config = app.get(ConfigService<Env>);
  const PORT = config.getOrThrow('PORT') || 3000;
  const NODE_ENV = config.getOrThrow('NODE_ENV') || 'local';
  const API_PREFIX = config.getOrThrow('API_PREFIX');
  const API_DOCS = `${API_PREFIX}/docs`;

  app.setGlobalPrefix(API_PREFIX);
  app.set('trust proxy', true);
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('html', hbs.__express);
  app.setViewEngine('html');

  // Cors configuration
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:3000',
      'https://local.envlink.one',
      'https://local-nest.utadev.app',
    ],
    credentials: true,
  });

  // Swagger / OpenAPI
  const swaggerConfig = getSwaggerDocumentConfig(config);
  const openApiDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_DOCS, app, cleanupOpenApiDoc(openApiDoc));

  const router = app.getHttpAdapter().getInstance();

  router.get(`/${API_DOCS}/openapi.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="openapi.json"');
    res.send(openApiDoc);
  });

  router.get(`/${API_DOCS}/openapi.yaml`, (req, res) => {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.setHeader('Content-Disposition', 'attachment; filename="openapi.yaml"');
    res.send(yaml.stringify(openApiDoc));
  });

  const logger = app.get(LoggerService);
  const seeder = app.get(PlanSeeder);
  await seeder.seed();

  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT} with env ${NODE_ENV}`);
  });
}

void bootstrap();
