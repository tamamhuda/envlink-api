import { ConfigService } from '@nestjs/config';
import { Env } from './env.config';
import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { JWT_REFRESH_SECURITY, JWT_SECURITY } from './jwt.config';
import { ErrorResponse } from 'src/common/dto/error-response.dto';

export const getSwaggerDocumentConfig = (
  config: ConfigService<Env>,
): Omit<OpenAPIObject, 'paths'> => {
  const APP_NAME = config.get<Env['APP_NAME']>('APP_NAME') ?? 'nest-app';
  const APP_DESCRIPTION =
    config.get<Env['APP_DESCRIPTION']>('APP_DESCRIPTION') ??
    'nest-js application';
  const APP_VERSION = config.get<Env['APP_VERSION']>('APP_VERSION') ?? 'v1.0.0';

  return (
    new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription(APP_DESCRIPTION)
      .setVersion(APP_VERSION)
      .setOpenAPIVersion('3.1.0')
      .addServer('https://local-nest.utadev.app', 'Development')
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
