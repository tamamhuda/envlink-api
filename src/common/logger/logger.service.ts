import {ExecutionContext, HttpException, Injectable, LoggerService as NestLoggerService} from "@nestjs/common";
import {winstonLogger as logger} from "../../config/winston.logger";
import {Request, Response} from "express";
import {ZodError} from "zod";

@Injectable()
export default class LoggerService implements NestLoggerService {

    log(message: string): void {
        logger.info(message);
    }

    info(message: string): void {
        logger.info(message);
    }

    error(message: string, trace?: string): void {
        logger.error(message, { trace });
    }

    warn(message: string): void {
        logger.warn(message);
    }

    debug(message: string): void {
        logger.debug(message);
    }

    verbose(message: string): void {
        logger.verbose(message);
    }

    getIp(request:Request): string {
        const forwarded = request.headers['x-forwarded-for'];
        return typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : request.ip || '';
    }

    httpException(handlerName: string, request: Request, exception: HttpException): void {
        const ip = this.getIp(request);

        const format = `${ip} - [${request.method} - ${exception.getStatus()}] ${request.originalUrl} - [${handlerName}] - ${exception.message}`
        this.error(format)
    }

    errorException(handlerName: string, request: Request, message: string, status: number) {
        const ip = this.getIp(request);
        const format = `[${request.method} - ${status}] ${request.originalUrl} - [${handlerName}] - ${message} - ${ip}`
        this.error(format)
    }

    interceptor( context:ExecutionContext, responseTime: number
    ): void {
        const ctx = context.switchToHttp()
        const request = ctx.getRequest<Request>()
        const response = ctx.getResponse<Response>();
        const controller = context.getClass().name
        const handler = context.getHandler().name
        const forwarded = request.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : request.ip;

        const format = `[${request.method} - ${response.statusCode}] ${request.originalUrl} - ${responseTime}ms - [${controller}/${handler}] - ${ip}`
        this.log(format)
    }

}