import {
  CallHandler,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Keyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import LoggerService from 'src/logger/logger.service';
import { CachePrefix } from 'src/common/enums/cache-prefix.enum';
import { StoredDataNoRaw } from 'keyv';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
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

  async invalidateCache<T>(store: Keyv, key: string): Promise<void> {
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
