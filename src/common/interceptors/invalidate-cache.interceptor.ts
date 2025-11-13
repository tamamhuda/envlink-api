import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CacheService } from 'src/common/cache/cache.service';
import LoggerService from '../logger/logger.service';
import { JwtUtil } from '../utils/jwt.util';
import {
  INVALIDATE_CACHES,
  InvalidateCacheConfig,
} from '../decorators/invalidate-cache.decorator';
import { CacheKeyContext } from '../interfaces/cache-context.interface';

@Injectable()
export class InvalidateCacheInterceptor<T> implements NestInterceptor<T, T> {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Promise<Observable<T>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    const configs =
      this.reflector.get<InvalidateCacheConfig<T>[]>(
        INVALIDATE_CACHES,
        handler,
      ) || [];

    if (!configs.length) return next.handle();

    const baseCtx: CacheKeyContext<T> = {
      params: request.params,
      query: request.query,
      body: request.body as CacheKeyContext['body'],
      user: request.user,
      sessionId: authorization
        ? await this.jwtUtil.extractSessionIdFromHeader(request)
        : undefined,
    };

    return next.handle().pipe(
      tap((data: T) => {
        void (async () => {
          for (const { prefix, key } of configs) {
            const ctx: CacheKeyContext<T> = { ...baseCtx, res: data };
            const resolvedKey = typeof key === 'function' ? key(ctx) : key;
            const store = await this.cache.getStore(prefix, next);
            await this.cache.invalidateCache(store, resolvedKey);
          }
        })();
      }),
    );
  }
}
