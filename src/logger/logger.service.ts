import {
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
``;
import { Request, Response } from 'express';
import { getClientIp } from 'src/utils/client-ip.util';

@Injectable()
export default class LoggerService extends Logger implements NestLoggerService {
  httpException(
    handlerName: string,
    request: Request,
    exception: HttpException,
  ): void {
    const ip = getClientIp(request);

    const format = `${ip} - [${request.method} - ${exception.getStatus()}] ${request.originalUrl} - [${handlerName}] - ${exception.message}`;
    this.error(format);
  }

  errorException(
    handlerName: string,
    request: Request,
    message: string,
    status: number,
  ) {
    const ip = getClientIp(request);
    const format = `[${request.method} - ${status}] ${request.originalUrl} - [${handlerName}] - ${message} - ${ip}`;
    this.error(format);
  }

  interceptor(context: ExecutionContext, responseTime: number): void {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const ip = getClientIp(request);

    const format = `[${request.method} - ${response.statusCode}] ${request.originalUrl} - ${responseTime}ms - [${controller}/${handler}] - ${ip}`;
    this.log(format);
  }
}
