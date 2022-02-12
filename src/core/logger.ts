import Winston from 'winston'
import path from 'path'

const logPath = path.join(process.cwd(), 'logs', 'debug.log')
const exceptionPath = path.join(process.cwd(), 'logs', 'exception.log')

const fileTransportOptions = (filename: string): Winston.transports.FileTransportOptions => ({
  filename,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 25,
  tailable: true,
  zippedArchive: true
})

const consoleTransport = process.env.NODE_ENV === 'production'
  ? new Winston.transports.Console({ format: Winston.format.colorize() })
  : new Winston.transports.Console()

export const Logger = Winston.createLogger({
  format: Winston.format.combine(
    Winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    Winston.format.errors({ stack: true }),
    Winston.format.splat(),
    Winston.format.json(),
    Winston.format.printf((info) => `${info.timestamp as string} ${info.level}: ${info.message}`)
  ),
  transports: [
    consoleTransport,
    new Winston.transports.File(fileTransportOptions(logPath))
  ],
  exceptionHandlers: [
    new Winston.transports.Console(),
    new Winston.transports.File(fileTransportOptions(exceptionPath))
  ],
  exitOnError: false
})
