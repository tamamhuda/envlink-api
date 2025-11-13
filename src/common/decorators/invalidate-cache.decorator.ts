import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CachePrefix } from '../enums/cache-prefix.enum';
import { CacheKeyContext } from '../interfaces/cache-context.interface';

export const INVALIDATE_CACHES = 'INVALIDATE_CACHES';

export interface InvalidateCacheConfig<T = any> {
  prefix: CachePrefix;
  key: string | ((ctx: CacheKeyContext<T>) => string);
}

export function InvalidateCache<T>(
  prefixOrConfigs: CachePrefix | InvalidateCacheConfig<T>[],
  keyOrFn?: string | ((ctx: CacheKeyContext<T>) => string),
) {
  const configs: InvalidateCacheConfig<T>[] = Array.isArray(prefixOrConfigs)
    ? prefixOrConfigs
    : [{ prefix: prefixOrConfigs, key: keyOrFn! }];

  return applyDecorators(SetMetadata(INVALIDATE_CACHES, configs));
}
