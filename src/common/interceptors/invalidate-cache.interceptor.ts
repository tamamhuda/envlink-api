import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tap } from 'rxjs/operators';
import LoggerService from '../logger/logger.service';
import { Request } from 'express';
import {
  INVALIDATE_CACHE_KEY,
  INVALIDATE_CACHE_PREFIX,
} from '../decorators/invalidate-cache.decorator';
import { CacheKeyContext } from '../interfaces/cache-context.interface';
import { Observable } from 'rxjs';
import { CacheService } from 'src/cache/cache.service';
import { CachePrefix } from '../enums/cache-prefix.enum';

@Injectable()
export class InvalidateCacheInterceptor<T> implements NestInterceptor<T, T> {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {}

  async intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Promise<Observable<T>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest<Request>();

    const cachePrefix = this.reflector.get<CachePrefix>(
      INVALIDATE_CACHE_PREFIX,
      handler,
    );

    const keyOrFn = this.reflector.get<
      string | ((ctx: CacheKeyContext<T>) => string)
    >(INVALIDATE_CACHE_KEY, handler);

    if (!cachePrefix || !keyOrFn) return next.handle();

    const store = await this.cache.getStore(cachePrefix, next);

    const baseCtx: CacheKeyContext<T> = {
      params: request.params,
      query: request.query,
      body: request.body as CacheKeyContext['body'],
      user: request.user,
      session: request.session,
    };

    return next.handle().pipe(
      tap((data: T) => {
        void (async () => {
          const ctx: CacheKeyContext<T> = { ...baseCtx, res: data };
          const key = typeof keyOrFn === 'function' ? keyOrFn(ctx) : keyOrFn;
          await this.cache.invalidateCache(store, key);
        })();
      }),
    );
  }
}
