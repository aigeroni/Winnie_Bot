const winston = require('winston')

const logPath = __dirname + '/logs/debug.log'
const exceptionPath = __dirname + '/logs/exception.log'

const logger = winston.createLogger({

  transports: [
    new winston.transports.Console({
      json: false,
      timestamp: true,
    }),
    new winston.transports.File({
      filename: logPath,
      maxSize: 10 * 1024 * 1024,
      maxFiles: 25,
      tailable: true,
      timestamp: true,
      depth: 5,
    }),
  ],

  exceptionHandlers: [
    new winston.transports.Console({
      json: false,
      timestamp: true,
    }),
    new winston.transports.File({
      filename: exceptionPath,
      maxSize: 10 * 1024 * 1024,
      maxFiles: 25,
      tailable: true,
      depth: 5,
    }),
  ],

  exitOnError: false,

})

module.exports = logger

