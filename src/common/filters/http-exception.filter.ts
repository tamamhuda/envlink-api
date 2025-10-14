import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ErrorResponse } from '../interfaces/api-response.intercace';
import { getReasonPhrase } from 'http-status-codes';
import { ZodError } from 'zod';
import LoggerService from '../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorException = exception.getResponse();
    let error: object | string = errorException;
    let message: string = getReasonPhrase(status);

    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError() as ZodError;
      error = zodError.issues;
      message = exception.message;
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      error = zodError.issues;
      message = exception.message;
    }

    this.logger.httpException(HttpExceptionFilter.name, request, exception);

    const errorResponse: ErrorResponse = {
      success: false,
      status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    response.status(status).json(errorResponse);
  }
}
