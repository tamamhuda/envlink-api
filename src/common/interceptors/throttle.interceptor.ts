import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { ThrottleService } from '../throttle/throttle.service';
import { Request, Response } from 'express';
import LoggerService from '../logger/logger.service';

@Injectable()
export class ThrottleInterceptor<T> implements NestInterceptor<T> {
  constructor(
    private readonly throttleService: ThrottleService,
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const throttle = request.throttle;
    const policy = throttle?.policy;

    // If no throttle policy — skip throttling entirely
    if (!policy) {
      return next.handle();
    }

    const key = throttle.key;
    const cost = throttle.cost ?? policy.cost ?? 1;

    // Process request, then consume tokens if chargeOnSuccess = true
    return next.handle().pipe(
      mergeMap(async (result) => {
        // Set initial headers before consumption (remaining before charge)
        await this.throttleService.applyRateLimiterHeader(
          response,
          key,
          policy,
        );

        // Only charge successful responses
        if (policy.chargeOnSuccess) {
          await this.throttleService.consume(key, policy, cost);
          // Reapply updated headers (after consuming)
          await this.throttleService.applyRateLimiterHeader(
            response,
            key,
            policy,
          );
        }

        return result;
      }),
      catchError((err) => throwError(() => err)),
    );
  }
}
