import * as z from 'zod';

import * as dotenv from 'dotenv';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'local']).default('local'),

    PORT: z.coerce.number().default(3000), // `coerce` if value comes from process.env

    APP_NAME: z.string().default('nestjs-app'),
    APP_DESCRIPTION: z.string().default('restful api develop using nest-js'),
    APP_VERSION: z.string().default('v1.0.0'),
    APP_URL: z.string().default('http://localhost:3000'),
    APP_SECRET: z.string().default('secret'),

    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USERNAME: z.string().nonempty(),
    DB_PASSWORD: z.string().nonempty(),
    DB_NAME: z.string().nonempty(),

    DATABASE_URL: z.string(),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),

    JWT_ACCESS_SECRET: z.string().default(''),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().default(''),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    CACHE_TTL: z.string().default('5m'),
    NGEST_HOST: z.string().nonempty(),
    SOURCE_TOKEN: z.string().nonempty(),

    AWS_SECRET_KEY: z.string().nonempty(),
    AWS_ACCESS_KEY: z.string().nonempty(''),
    AWS_S3_BUCKET: z.string().nonempty(''),
    AWS_S3_REGION: z.string().nonempty(''),

    MAILTRAP_TOKEN: z.string().nonempty(),
    TEMPLATE_ID_VERIFY_EMAIL: z.string().nonempty(),
    MAIL_SENDER: z.string().nonempty('no-reply@envlink.one'),

    IP2_API_KEY: z.string().nonempty(),
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
