import Winston from 'winston'

const logPath = __dirname + '/logs/debug.log'
const exceptionPath = __dirname + '/logs/exception.log'

const fileTransportOptions = (filename: string): Winston.transports.FileTransportOptions => ({
  filename,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 25,
  tailable: true,
  zippedArchive: true,
})

const logger = Winston.createLogger({
  format: Winston.format.combine(
    Winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    Winston.format.errors({ stack: true }),
    Winston.format.splat(),
    Winston.format.json()
  ),
  transports: [
    new Winston.transports.File(fileTransportOptions(logPath)),
  ],
  exceptionHandlers: [
    new Winston.transports.Console(),
    new Winston.transports.File(fileTransportOptions(exceptionPath)),
  ],
  exitOnError: false,
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new Winston.transports.Console({
    format: Winston.format.combine(
      Winston.format.colorize(),
      Winston.format.simple()
    ),
  }))
}

export default logger
