import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import LoggerService from '../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        this.logger.httpException(HttpExceptionFilter.name, request, exception);

        response.status(status).json({
            statusCode: status,
            message: exception.message,
            path: request.originalUrl,
            method: request.method,
            timestamp: new Date().toISOString(),
        });
    }
}
