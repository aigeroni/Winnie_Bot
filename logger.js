
var winston = require('winston');
 
var logPath       = __dirname + '/logs/debug.log';
var exceptionPath = __dirname + '/logs/exception.log';

var logger = new (winston.Logger)({
  
  transports: [
    new (winston.transports.Console)({
        json: false,
        timestamp: true
    }),
    new winston.transports.File({
        filename: logPath,
        maxSize: 10 * 1024 * 1024,
        maxFiles: 25,
        tailable: true,
        depth: 5
    })
  ],
  
  exceptionHandlers: [
    new (winston.transports.Console)({
        json: false,
        timestamp: true
    }),
    new winston.transports.File({
        filename: exceptionPath,
        maxSize: 10 * 1024 * 1024,
        maxFiles: 25,
        tailable: true,
        depth: 5
    })
  ],
  
  exitOnError: false

});

module.exports = logger;

