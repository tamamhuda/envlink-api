import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import LoggerService from 'src/common/logger/logger.service';

@Catch()
export default class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { httpAdapter } = this.httpAdapterHost;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const path = httpAdapter.getRequestUrl(request);
    const message =
      exception instanceof Error ? exception.message : 'Internal Server Error';

    const responseBody = {
      status: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: path,
    };

    this.logger.errorException(
      CatchEverythingFilter.name,
      request,
      message,
      status,
    );

    this.logger.error(JSON.stringify(exception, null, 2));

    httpAdapter.reply(response, responseBody, status);
  }
}
