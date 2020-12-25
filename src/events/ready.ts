import { Client } from 'discord.js'
import { Event } from './event'
import { I18n } from '../core/i18n'
import { Logger } from '../core/logger'
import { createConnection } from 'typeorm'

/**
 * Handles the ready event, fired whenthe bot first connects to discord.
 *
 * Used for:
 *  - setting Winnie_Bot's status
 *  - establishing a database connection
 */
export const ReadyEvent: Event = {
  name: 'ready',
  handle: async (client: Client) => {
    try {
      await createConnection()
    } catch (error) {
      Logger.error(`An error occured while connecting to the database: ${error}`)
      process.exit()
    }

    const activity = await I18n.translate('en', 'activity')
    client.user?.setActivity(activity)
  },
}
