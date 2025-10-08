import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodSerializationException } from 'nestjs-zod';
import LoggerService from 'src/logger/logger.service';
import { ZodError } from 'zod/v3';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const error = exception.getResponse();

    if (exception instanceof ZodSerializationException) {
      this.logger.error(
        `Zod Serialization Error ${JSON.stringify(exception.getZodError())}`,
      );
    }

    this.logger.httpException(HttpExceptionFilter.name, request, exception);

    response.status(status).json({
      path: request.originalUrl,
      method: request.method,
      statusCode: status,
      ...(typeof error === 'object' ? error : { message: error }),
      timestamp: new Date().toISOString(),
    });
  }
}
