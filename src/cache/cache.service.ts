import {
  CallHandler,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Keyv } from '@keyv/redis';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { StoredDataNoRaw } from 'keyv';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CacheService {
  constructor(
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async getStore(cachePrefix: CachePrefix, next?: CallHandler): Promise<Keyv> {
    const store = this.cache.stores.find(
      (keyv: Keyv) => keyv.namespace === cachePrefix,
    );
    if (!store && next) next.handle();
    if (!store)
      throw new InternalServerErrorException(
        'No cache store found for prefix: ${cachePrefix}',
      );

    return Promise.resolve(store);
  }

  async getCache<T>(
    cachePrefix: CachePrefix,
    key: string,
  ): Promise<StoredDataNoRaw<T>> {
    const store = await this.getStore(cachePrefix);
    return await store.get<T>(key).then((result: T) => {
      if (result) {
        this.logger.debug(`[CACHE-HIT]: ${cachePrefix}:${key}`);
      }
      return result;
    });
  }

  async set(
    cachePrefix: CachePrefix,
    key: string,
    value: any,
    ttl?: number,
  ): Promise<boolean> {
    const store = await this.getStore(cachePrefix);

    return await store.set(key, value, ttl).then((result) => {
      this.logger.debug(
        `[CACHE-SET]: ${cachePrefix}:${key} (TTL: ${ttl ?? '-'})`,
      );
      return result;
    });
  }

  async invalidateBatch(prefix: string, key: string) {
    const pattern = `${prefix}:${key}`;
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [next, batch] = await this.redis.scan(cursor, 'MATCH', pattern);
      cursor = next;
      if (batch.length) keys.push(...batch);
    } while (cursor !== '0');

    if (keys.length) {
      await this.redis.del(...keys);
      this.logger.debug(
        `[CACHE-INVALIDATE] ${keys.length} keys invalidated for "${pattern}"`,
      );
    }
  }

  async invalidateCache<T>(store: Keyv, key: string): Promise<void> {
    if (store.namespace && key.includes('*')) {
      await this.invalidateBatch(store.namespace, key);
    }

    const exists = await store.get<T>(key);
    if (!exists) return;

    await store.delete(key).then(() => {
      this.logger.debug(`[CACHE-INVALIDATE]: ${store.namespace}:${key}`);
    });
  }

  async invalidateKeys(
    cachePrefix: CachePrefix,
    keys: string[],
  ): Promise<void> {
    const store = await this.getStore(cachePrefix);
    await Promise.all(keys.map((key) => store.delete(key)));
  }

  async invalidateByPrefix(cachePrefix: CachePrefix): Promise<void> {
    const store = await this.getStore(cachePrefix);
    await store.clear();
  }
}
