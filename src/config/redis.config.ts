import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.type";
import {RedisModuleOptions} from "@nestjs-modules/ioredis";


export const getRedisConfig =  (config: ConfigService<EnvVars>): RedisModuleOptions => {
    return {
        type: "single",
        options: {
            port: config.get('REDIS_PORT', { infer: true }),
            host: config.get('REDIS_HOST', { infer: true }),
        }
    }
}