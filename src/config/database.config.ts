import {ConfigService} from "@nestjs/config";
import {EnvVars} from "./env.type";
import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as path from "path"


export const getDatabaseConfig = (
    config: ConfigService<EnvVars>
): PostgresConnectionOptions => ({
    type: 'postgres',
    url: config.get('DATABASE_URL', { infer: true }),
    port: config.get('DB_PORT', { infer: true }),
    entities: [path.resolve(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: config.get('NODE_ENV', { infer: true }) !== 'production',
});