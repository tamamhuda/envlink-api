import {createLogger, format, LoggerOptions, transports} from "winston";
import * as process from "node:process";


type LoggerType = "console" | "file"

const formattedLogger = format.printf(({stack, message, level, timestamp}) => {
    return `[${String(process.env.APP_NAME ?? 'NEST').toUpperCase()}] - ${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${message || stack}`
})

const transportsOptions : Record<LoggerType, any > = {
    console: {
         level: "silly"
    },
    file: {
        error : {
            level: "error",
            filename: "logs/error.log"
        },
        info: {
            level: "info",
            filename: "logs/info.log"
        }
    }
}



const options : Record<LoggerType, LoggerOptions> = {
    console: {
        format: format.combine(
            format.timestamp(),
            format.errors({stack: true}),
            formattedLogger
        ),
        transports: new transports.Console(transportsOptions.console)
    },
    file: {
        format: format.combine(
            format.timestamp(),
            format.errors({stack: true}),
            format.json()
        ),
        transports: [
            new transports.File(transportsOptions.file.error),
            new transports.File(transportsOptions.file.info)
        ]
    }
}

export const winstonLogger = createLogger(
    process.env.NODE_ENV === "production" ? options.file : options.console
)