import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.intercace';
import LoggerService from 'src/common/logger/logger.service';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const path = request.originalUrl;
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        return {
          success: true,
          status: response.statusCode,
          path,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
