import * as Joi from "joi";
import {ObjectSchema} from "joi";
import {EnvVars} from "./env.type";


export const envValidationSchema: ObjectSchema<EnvVars> = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'local')
        .default('local'),

    PORT: Joi.number().default(3000),

    DB_HOST: Joi.string().default('localhost'),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    DATABASE_URL: Joi.string().required(),

    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),

    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),      // e.g., '15m', '1h'
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

    CACHE_TTL: Joi.string().default('5m'),

});
