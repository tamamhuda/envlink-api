import {
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { Job } from 'bullmq';
import { Request, Response } from 'express';
import { IpService } from '../internal-services/request/ip.service';

@Injectable()
export default class LoggerService extends Logger implements NestLoggerService {
  constructor(private readonly ipService: IpService) {
    super();
  }

  httpException(
    handlerName: string,
    request: Request,
    exception: HttpException,
  ): void {
    const ip = this.ipService.getClientIp(request);
    const format = `${ip} - [${request.method} - ${exception.getStatus()}] ${request.originalUrl} - [${handlerName}] - ${exception.message}`;
    this.error(format);
    this.error(JSON.stringify(exception, null, 2));
  }

  errorException(
    handlerName: string,
    request: Request,
    message: string,
    status: number,
  ) {
    const ip = this.ipService.getClientIp(request);
    const format = `[${request.method} - ${status}] ${request.originalUrl} - [${handlerName}] - ${message} - ${ip}`;
    this.error(format);
  }

  interceptor(context: ExecutionContext, responseTime: number): void {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const ip = this.ipService.getClientIp(request);

    const format = `[${request.method} - ${response.statusCode}] ${request.originalUrl} - ${responseTime}ms - [${controller}/${handler}] - ${ip}`;
    this.log(format);
  }

  jobActive(job: Job) {
    this.debug(`[${job.queueName}:${job.id}]: STARTED`);
  }

  jobCompleted(job: Job) {
    const duration = Date.now() - job.timestamp;
    const data = job.returnvalue;
    const result = data ? JSON.stringify(data, null, 2) : 'SKIPPED';
    this.debug(
      `[${job.queueName}:${job.id}]: COMPLETED - ${duration}ms : ${result}`,
    );
  }

  jobFailed(job: Job) {
    const error = job.failedReason;
    this.error(
      `[${job.queueName}:${job.id}]: FAILED:ATTEMPT-${job.attemptsMade} - ${JSON.stringify(error, null, 2)}`,
    );
  }

  json(message: string = '', data: any) {
    this.debug(`${message}${JSON.stringify(data, null, 2)}`);
  }
}
