import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import snakecaseKeys from 'snakecase-keys';

@Injectable()
export class SnakeCaseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        if (data == null) return data;

        // convert entity or DTO instance to plain object
        const plainData = Array.isArray(data)
          ? data.map((item) => instanceToPlain(item))
          : instanceToPlain(data);

        // now apply snake_case transformation safely
        return snakecaseKeys(plainData, { deep: true });
      }),
    );
  }
}
