import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.validation";
import {RedisModuleOptions} from "@nestjs-modules/ioredis";
import {RedisOptions} from "ioredis";



export const getRedisClientConfig = async (config : ConfigService<EnvVars>, db: number) : Promise<RedisOptions> => {
    return {
        port: config.get('REDIS_PORT', { infer: true }),
        host: config.get('REDIS_HOST', { infer: true }),
        db: db,
    }
}


export const getRedisConfig = async (config: ConfigService<EnvVars>): Promise<RedisModuleOptions> => {
    const redis = await getRedisClientConfig(config, 0)
    return {
        type: "single",
        options: redis
    }
}