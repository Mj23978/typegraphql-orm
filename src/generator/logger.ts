import { createLogger, format, LoggerOptions, transports } from 'winston'

export const loggerOptions: LoggerOptions = {
  format: format.combine(
    format.json(),
    format.errors({ stack: true }),
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console({
      level: "debug",
    }),
    new transports.File({
      level: "error",
      filename: "tog-cli.log",
    }),
  ],
};


export const logger = createLogger({
  level: "info",
  ...loggerOptions,
});