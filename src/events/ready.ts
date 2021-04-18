import { Event } from '../types/event'
import { I18n } from '../core/i18n'
import { Logger } from '../core/logger'
import { WinnieClient } from '../core/winnie-client'
import { createConnection } from 'typeorm'

/**
 * Handles the ready event, fired when the bot first connects to discord.
 *
 * Used for:
 *  - setting Winnie_Bot's status
 *  - establishing a database connection
 */
export const ReadyEvent: Event = {
  name: 'ready',
  handle: async () => {
    try {
      await createConnection()
    } catch (error) {
      const errorMessage: string = error.toString()
      Logger.error(`An error occured while connecting to the database: ${errorMessage}`)
      process.exit()
    }

    const activity = await I18n.translate('en', 'activity')
    WinnieClient.client.user?.setActivity(activity)
  }
}
