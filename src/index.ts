import { Events } from './events'
import { Logger, WinnieClient } from './core'

WinnieClient.start(Events.eventsList).catch((error) => {
  const errorMessage: string = error.toString()
  Logger.error(`Unable to start Winnie.\n${errorMessage}`)
  process.exit()
})
