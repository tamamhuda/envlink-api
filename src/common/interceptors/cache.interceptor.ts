import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import LoggerService from '../logger/logger.service';
import { from, Observable, of, switchMap, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {
  CACHE_KEY,
  CACHE_PREFIX,
  CACHE_TTL,
} from '../decorators/cached.decorator';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../config/env.config';
import * as ms from 'ms';
import { StringValue } from 'ms';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { CachePrefix } from '../enums/cache-prefix.enum';
import { Request, Response } from 'express';
import { KeyvStoreAdapter } from 'keyv';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
    private readonly config: ConfigService<Env>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest<Request>();
    const keyOrFn = this.reflector.get<string | ((param: any) => string)>(
      CACHE_KEY,
      handler,
    );

    if (!keyOrFn) return next.handle();

    const fallback_ttl = ms(
      this.config.get<Env['CACHE_TTL']>('CACHE_TTL') as StringValue,
    );

    const cachePrefix = this.reflector.get<CachePrefix>(CACHE_PREFIX, handler);
    const ttl = this.reflector.get<number>(CACHE_TTL, handler) ?? fallback_ttl;
    const key =
      typeof keyOrFn === 'function' ? keyOrFn(request.params) : keyOrFn;

    if (!cachePrefix) {
      this.logger.warn(`No cache prefix provided for handler: ${handler.name}`);
      return next.handle();
    }

    const store = this.cache.stores.find(
      (keyv) => (keyv.store as KeyvStoreAdapter).namespace === cachePrefix,
    );

    if (!store) return next.handle();

    return from(store.get<unknown>(key)).pipe(
      switchMap((cached) => {
        if (cached) {
          request.res?.setHeader('X-Cache', 'HIT');
          this.logger.debug(`[CACHE-HIT] ${cachePrefix}:${key}`);
          return of(cached);
        }

        request.res?.setHeader('X-Cache', 'MISS');
        this.logger.debug(`[Cache MISS] ${cachePrefix}:${key}`);

        return next.handle().pipe(
          tap((data: unknown) => {
            void store.set(key, data, ttl);
            this.logger.debug(
              `[Cache SET] ${cachePrefix}:${key} (TTL: ${ttl}ms)`,
            );
          }),
        );
      }),
    );
  }
}
