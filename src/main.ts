import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import LoggerService from './common/logger/logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './config/winston.logger';
import { ConfigService } from '@nestjs/config';
import { Env } from './config/env.config';
import { getSwaggerDocumentConfig } from './config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  const config = app.get(ConfigService<Env>);

  const PORT = config.get<Env['PORT']>('PORT') || 3000;
  const NODE_ENV = config.get<Env['NODE_ENV']>('NODE_ENV') || 'local';

  const documentConfig = getSwaggerDocumentConfig(config);
  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const logger = app.get(LoggerService);

  await app.listen(PORT, () => {
    logger.log(`Server is running on port ${PORT} with env ${NODE_ENV}`);
  });

  app.setGlobalPrefix(`api`);
}

bootstrap();
