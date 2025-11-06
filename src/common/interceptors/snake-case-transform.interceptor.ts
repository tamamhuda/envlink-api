import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import LoggerService from '../logger/logger.service';
import snakecaseKeys from 'snakecase-keys';

@Injectable()
export class SnakeCaseResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => snakecaseKeys(data, { deep: true })));
  }
}
