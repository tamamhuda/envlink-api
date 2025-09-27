import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as path from 'path';
import { Env } from './env.config';

export const getDatabaseConfig = (
  config: ConfigService<Env>,
): PostgresConnectionOptions => ({
  type: 'postgres',
  url: config.get<Env['DATABASE_URL']>('DATABASE_URL'),
  port: config.get<Env['DB_PORT']>('DB_PORT'),
  entities: [path.resolve(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: config.get<Env['NODE_ENV']>('NODE_ENV') !== 'production',
});
