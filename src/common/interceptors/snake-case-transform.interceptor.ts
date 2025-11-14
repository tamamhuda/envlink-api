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

        // normalize dates
        const normalizedData = this.normalizeDates(plainData);

        // apply snake_case transformation
        return snakecaseKeys(normalizedData, { deep: true });
      }),
    );
  }

  normalizeDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString(); // convert Date to string
    if (Array.isArray(obj)) return obj.map(this.normalizeDates);
    if (typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.normalizeDates(value);
      }
      return result;
    }
    return obj;
  }
}
