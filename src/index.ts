import { Events } from './events'
import { I18n } from './core/i18n'
import { Logger } from './core/logger'
import { WinnieClient } from './core/winnie-client'

/**
 * The main function that starts Winnie.
 */
async function startWinnie(): Promise<void> {
  Logger.info('Welcome to Winnie_Bot!')

  await I18n.init()

  Logger.info('Starting Winnie')
  WinnieClient.registerEvents(Events.eventsList)
  WinnieClient.login()
    .then(() => {
      Logger.info('Successfully logged in to Discord.')
    })
    .catch(() => {
      Logger.error('Unable to log in to discord, did you set your bot token?')
      process.exit()
    })
}

startWinnie().catch((error) => {
  Logger.error(`Unable to start Winnie.\n${error}`)
  process.exit()
})
