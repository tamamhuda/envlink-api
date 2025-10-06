import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CachePrefix } from '../enums/cache-prefix.enum';
import { Request } from 'express';
import { CacheKeyContext } from '../interfaces/cache-context.interface';

export const CACHE_PREFIX = 'CACHE_PREFIX';
export const CACHE_KEY = 'CACHE_KEY';
export const CACHE_TTL = 'CACHE_TTL';

export const Cached = (
  cachePrefix: CachePrefix,
  keyOrFn: string | ((ctx: CacheKeyContext) => string),
  ttl?: number,
) =>
  applyDecorators(
    SetMetadata(CACHE_PREFIX, cachePrefix),
    SetMetadata(CACHE_KEY, keyOrFn),
    SetMetadata(CACHE_TTL, ttl),
  );
