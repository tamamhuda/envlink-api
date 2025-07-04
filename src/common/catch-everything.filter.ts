import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from "@nestjs/common";
import {HttpAdapterHost} from "@nestjs/core";
import {Request, Response} from "express";


@Catch()
export default class CatchEverythingFilter implements ExceptionFilter {
    constructor (private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const {httpAdapter} = this.httpAdapterHost

        const httpStatus = exception instanceof HttpException ?
            exception.getStatus() :
            HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            status: httpStatus,
            timestamp: new Date().toISOString(),
            path : httpAdapter.getRequestUrl(request)
        }

        httpAdapter.reply(response, responseBody, httpStatus);

    }
}