import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.type";
import {RedisOptions} from "ioredis";


export const getRedisConfig =  (config: ConfigService<EnvVars>): RedisOptions => {
    return {
        port: config.get('REDIS_PORT', { infer: true }),
        host: config.get('REDIS_HOST', { infer: true }),
    }
}