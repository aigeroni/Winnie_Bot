# Logs go here

this file ensures that the logs folder exists when doing a fresh git clone.

## debug.log

debug.log contains all manually logged information via `logger.info()`, `logger.error()`, etc.

## exception.log

exception.log contains data on all thrown exceptions.

## rotation

logs are rotated at 10 mb and a max of 25 files are kept. the most recent file is debug.log with numbers accending for older logs.
