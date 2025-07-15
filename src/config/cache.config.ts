import {createKeyv} from "@keyv/redis";
import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.type";
import {CacheManagerOptions} from "@nestjs/cache-manager";
import {getRedisClientConfig} from "./redis.config";
import * as ms from "ms"
import {StringValue} from "ms";
import {CachePrefix} from "../common/enums/cache-prefix.enum";

export const getCacheConfig = async (config : ConfigService<EnvVars>) : Promise<CacheManagerOptions>   => {
    const redisConfig = await getRedisClientConfig(config, 1)
    const redis = `redis://${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`;
    const ttl = ms(config.get('CACHE_TTL', {infer : true}) as StringValue);

    const stores = Object.values(CachePrefix).map((namespace) =>
        createKeyv(redis, {
            namespace,
            keyPrefixSeparator: ':'
        })
    )

    return {
        stores,
        ttl
    }
}