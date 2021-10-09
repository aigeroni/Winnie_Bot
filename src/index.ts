import { Events } from './events'
import { Logger, WinnieClient } from './core'
import { scheduleJobs } from './scheduler'

function onSuccessfulStartUp (): void {
  scheduleJobs()
}

function onFailedStartUp (error: any): void {
  const errorMessage: string = error.toString()
  Logger.error(`Unable to start Winnie.\n${errorMessage}`)
  process.exit()
}

WinnieClient
  .start(Events.eventsList)
  .then(onSuccessfulStartUp)
  .catch(onFailedStartUp)
