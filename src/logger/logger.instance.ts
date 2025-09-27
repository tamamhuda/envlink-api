import { loggerConfig } from 'src/config/winston.config';
import * as winston from 'winston';

export const instance = winston.createLogger(
  process.env.NODE_ENV === 'production'
    ? loggerConfig.file
    : loggerConfig.console,
);
