import * as z from 'zod';

import * as dotenv from 'dotenv';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'local']).default('local'),

    PORT: z.coerce.number().default(3000), // `coerce` if value comes from process.env

    APP_NAME: z.string().nonempty().default('nestjs-app'),
    APP_DESCRIPTION: z.string().default('restful api develop using nest-js'),
    APP_VERSION: z.string().default('v1.0.0'),

    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    DATABASE_URL: z.string(),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),

    JWT_ACCESS_SECRET: z.string(),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'), // e.g., '15m', '1h'
    JWT_REFRESH_SECRET: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    CACHE_TTL: z.string().default('5m'),
  })
  .required();

export type Env = z.infer<typeof envSchema>;

const NODE_ENV: Env['NODE_ENV'] =
  (process.env.NODE_ENV as Env['NODE_ENV']) || 'local';

export const ENV_PATH = `.env.${NODE_ENV}`;

export function envValidate(env: Record<string, unknown>) {
  return envSchema.parse(env);
}

export const config: Env = envSchema.parse(
  dotenv.config({
    path: ENV_PATH,
  }).parsed,
);
