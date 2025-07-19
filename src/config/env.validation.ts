import * as z from 'zod'

export const envValidationSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'local']).default('local'),

    PORT: z.coerce.number().default(3000), // `coerce` if value comes from process.env

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

    CACHE_TTL: z.string().default('5m')

})



export type EnvVars = z.infer<typeof envValidationSchema>
