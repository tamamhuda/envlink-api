import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, Observable, of, switchMap, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {
  CACHE_KEY,
  CACHE_PREFIX,
  CACHE_TTL,
} from '../decorators/cached.decorator';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../config/env.config';
import ms, { StringValue } from 'ms';
import { CachePrefix } from '../enums/cache-prefix.enum';
import { Request } from 'express';
import { CacheKeyContext } from '../interfaces/cache-context.interface';
import { CacheService } from 'src/common/cache/cache.service';
import LoggerService from '../logger/logger.service';
import { JwtUtil } from '../utils/jwt.util';

@Injectable()
export class CacheInterceptor<T> implements NestInterceptor<T, T> {
  private readonly CACHE_TTL: number;
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
    private readonly config: ConfigService<Env>,
    private readonly cache: CacheService,
    private readonly jwtUtil: JwtUtil,
  ) {
    this.CACHE_TTL = ms(
      this.config.get<Env['CACHE_TTL']>('CACHE_TTL') as StringValue,
    );
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Promise<Observable<T>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    const keyOrFn = this.reflector.get<
      string | ((ctx: CacheKeyContext<T>) => string)
    >(CACHE_KEY, handler);

    const cachePrefix = this.reflector.get<CachePrefix>(CACHE_PREFIX, handler);

    if (!cachePrefix || !keyOrFn) return next.handle();

    const baseCtx: CacheKeyContext<T> = {
      params: request.params,
      query: request.query,
      body: request.body as CacheKeyContext['body'],
      user: request.user,
      sessionId: authorization
        ? await this.jwtUtil.extractSessionIdFromHeader(request)
        : undefined,
    };
    const key = typeof keyOrFn === 'string' ? keyOrFn : keyOrFn(baseCtx);

    const cached = this.cache.getCache<T>(cachePrefix, key);

    return from(cached).pipe(
      switchMap((cached) => {
        if (cached) {
          request.res?.setHeader('X-Cache', 'HIT');
          return of(cached);
        }

        request.res?.setHeader('X-Cache', 'MISS');
        return next.handle().pipe(
          tap((data: T) => {
            const ctx: CacheKeyContext<T> = { ...baseCtx, res: data };
            const key = typeof keyOrFn === 'function' ? keyOrFn(ctx) : keyOrFn;
            const ttl =
              this.reflector.get<number>(CACHE_TTL, handler) ?? this.CACHE_TTL;
            void this.cache.set(cachePrefix, key, data, ttl);
          }),
        );
      }),
    );
  }
}
