import { format, LoggerOptions, transports } from 'winston';
import chalk from 'chalk';
import {
  ConsoleTransportOptions,
  FileTransportOptions,
} from 'winston/lib/winston/transports';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { config } from './env.config';

type LoggerType = 'console' | 'file';
type FileLevelTransportOptions = Record<
  'error' | 'info',
  ConsoleTransportOptions | FileTransportOptions
>;

const levelColors: Record<string, (txt: string) => string> = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.green.bold,
  http: chalk.magenta,
  verbose: chalk.cyan,
  debug: chalk.blue,
  silly: chalk.gray,
};

const formattedLogger = format.printf(
  ({ stack, message, level, timestamp }) => {
    const appName = chalk.white.bold(
      String(config.APP_NAME ?? 'NEST').toUpperCase(),
    );

    const time = chalk.gray(timestamp as string);

    const lvl = levelColors[level]
      ? levelColors[level](level.toUpperCase().padEnd(7))
      : level.toUpperCase().padEnd(7);

    return `[${appName}] - ${time} - [${lvl}] - ${(message || stack) as string}`;
  },
);

const logtail = new Logtail(config.SOURCE_TOKEN || '', {
  endpoint: `https://${config.NGEST_HOST || ''}`,
});

const transportsOptions: Record<
  LoggerType,
  FileLevelTransportOptions | ConsoleTransportOptions
> = {
  console: {
    level: 'silly',
  },
  file: {
    error: {
      level: 'error',
      filename: 'logs/error.log',
    },
    info: {
      level: 'info',
      filename: 'logs/info.log',
    },
  },
};

export const loggerConfig: Record<LoggerType, LoggerOptions> = {
  console: {
    format: format.combine(
      format.colorize({ message: true }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      formattedLogger,
    ),
    transports: [
      new transports.Console(
        transportsOptions.console as ConsoleTransportOptions,
      ),
    ],
  },
  file: {
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    ),
    transports: [
      new transports.File(
        (transportsOptions.file as FileLevelTransportOptions).error,
      ),
      new transports.File(
        (transportsOptions.file as FileLevelTransportOptions).info,
      ),
      new LogtailTransport(logtail),
    ],
  },
};
