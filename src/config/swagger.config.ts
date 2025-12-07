import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';
import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { JWT_REFRESH_SECURITY, JWT_SECURITY } from './jwt.config';
import { ErrorResponse } from 'src/common/dto/error-response.dto';

export const getSwaggerDocumentConfig = (
  config: ConfigService<Env>,
): Omit<OpenAPIObject, 'paths'> => {
  const APP_NAME = config.getOrThrow<Env['APP_NAME']>('APP_NAME') ?? 'nest-app';
  const APP_DESCRIPTION =
    config.getOrThrow<Env['APP_DESCRIPTION']>('APP_DESCRIPTION') ??
    'nest-js application';
  const APP_VERSION =
    config.getOrThrow<Env['APP_VERSION']>('APP_VERSION') ?? 'v1.0.0';
  const APP_URL = config.getOrThrow<Env['APP_URL']>('APP_URL');
  const APP_TAG = config.getOrThrow<Env['APP_TAG']>('APP_TAG');

  return (
    new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription(APP_DESCRIPTION)
      .setVersion(APP_VERSION)
      .setOpenAPIVersion('3.1.0')
      .addServer(APP_URL, APP_TAG)
      .addServer('https://api.envlink.one', 'Production')
      // Correct JWT bearer configuration
      .addSecurity(JWT_SECURITY, {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access Token authentication',
      })
      .addSecurity(JWT_REFRESH_SECURITY, {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Refresh Token authentication',
      })
      .addGlobalResponse({
        type: ErrorResponse,
        description: 'API Error Response',
        status: '4XX',
      })
      .build()
  );
};
