import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CachePrefix } from '../enums/cache-prefix.enum';
import { CacheKeyContext } from '../interfaces/cache-context.interface';

export const INVALIDATE_CACHE_PREFIX = 'INVALIDATE_CACHE_PREFIX';
export const INVALIDATE_CACHE_KEY = 'INVALIDATE_CACHE_KEY';

export const InvalidateCache = <T>(
  cachePrefix: CachePrefix,
  keyOrFn: string | ((ctx: CacheKeyContext<T>) => string),
) =>
  applyDecorators(
    SetMetadata(INVALIDATE_CACHE_PREFIX, cachePrefix),
    SetMetadata(INVALIDATE_CACHE_KEY, keyOrFn),
  );
