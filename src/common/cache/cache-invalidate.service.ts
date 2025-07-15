import {Inject, Injectable, InternalServerErrorException} from "@nestjs/common";
import {CACHE_MANAGER, Cache} from "@nestjs/cache-manager";
import {CachePrefix} from "../enums/cache-prefix.enum";
import {Keyv} from "@keyv/redis";


@Injectable()
export class CacheInvalidateService {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

    async getStore(cachePrefix: CachePrefix): Promise<Keyv> {
        const store =  this.cache.stores.find((keyv) => keyv?.namespace === cachePrefix);
        if (!store) throw new InternalServerErrorException("No cache store found for prefix: ${cachePrefix}");
        return store;

    }

    async invalidateKeys(cachePrefix: CachePrefix, keys: string[]): Promise<void> {
        const store = await this.getStore(cachePrefix);
        await Promise.all(keys.map((key) => store.delete(key)))
    }

    async invalidateByPrefix(cachePrefix: CachePrefix): Promise<void> {
        const store = await this.getStore(cachePrefix);
        await store.clear()
    }

}
