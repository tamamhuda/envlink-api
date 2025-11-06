import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';
import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { JWT_REFRESH_SECURITY, JWT_SECURITY } from './jwt.config';

export const getSwaggerDocumentConfig = (
  config: ConfigService<Env>,
): Omit<OpenAPIObject, 'paths'> => {
  const APP_NAME = config.get<Env['APP_NAME']>('APP_NAME') ?? 'nest-app';
  const APP_DESCRIPTION =
    config.get<Env['APP_DESCRIPTION']>('APP_DESCRIPTION') ??
    'nest-js application';
  const APP_VERSION = config.get<Env['APP_VERSION']>('APP_VERSION') ?? 'v1.0.0';
  return new DocumentBuilder()

    .setTitle(APP_NAME)
    .addServer('http://localhost:3000', 'Local Development')
    .addServer(
      'https://local-nest.utadev.app',
      'Local Development (Cloudflare Tunnel)',
    )
    .addServer('https://staging.enlink.app', 'Staging Environment')
    .addServer('https://api.envlink.one', 'Production API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter Access Token (Bearer <token>)',
        in: 'header',
      },
      JWT_SECURITY,
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter Refresh Token (Bearer <token>)',
        in: 'header',
      },
      JWT_REFRESH_SECURITY,
    )
    .setDescription(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .build();
};
