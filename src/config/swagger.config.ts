import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';
import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { JWT_SECURITY } from './jwt.config';

export const getSwaggerDocumentConfig = (
  config: ConfigService<Env>,
): Omit<OpenAPIObject, 'paths'> => {
  const APP_NAME = config.get<Env['APP_NAME']>('APP_NAME') ?? 'nest-app';
  const APP_DESCRIPTION =
    config.get<Env['APP_DESCRIPTION']>('APP_DESCRIPTION') ??
    'nest-js application';
  const APP_VERSION = config.get<Env['APP_VERSION']>('APP_VERSION') ?? 'v1.0.0';
  return new DocumentBuilder()

    .addBearerAuth(
      {
        name: 'JWT',
        description: 'Bearer token',
        bearerFormat: 'JWT',
        type: 'http',
        scheme: 'bearer',
        in: 'header',
      },
      JWT_SECURITY,
    )
    .setTitle(APP_NAME)
    .setDescription(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .build();
};
