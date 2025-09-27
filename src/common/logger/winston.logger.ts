import winston from 'winston';
import { loggerConfig } from '../../config/winston.config';

export const winstonLogger = winston.createLogger(
  process.env.NODE_ENV === 'production'
    ? loggerConfig.file
    : loggerConfig.console,
);
