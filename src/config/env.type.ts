
export interface EnvVars {
    NODE_ENV: 'development' | 'production' | 'local'
    PORT: number;

    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;

    DATABASE_URL: string;

    REDIS_HOST: string;
    REDIS_PORT: number;

    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES_IN: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRES_IN: string,

}