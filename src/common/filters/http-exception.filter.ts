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

        const error = exception.getResponse();

        this.logger.httpException(HttpExceptionFilter.name, request, exception);

        response.status(status).json({
            path: request.originalUrl,
            method: request.method,
            statusCode: status,
            ...(
                typeof error === 'object'
                    ? error
                    : { message: error }
            ),
            timestamp: new Date().toISOString(),
        });
    }
}
