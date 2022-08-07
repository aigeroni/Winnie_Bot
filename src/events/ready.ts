import { Event } from '../types'
import { I18n, Logger, WinnieClient } from '../core'
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  handle: async () => {
    try {
      await createConnection()
    } catch (error: any) {
      const errorMessage: string = error.toString()
      Logger.error(`An error occured while connecting to the database: ${errorMessage}`)
      process.exit()
    }

    const activity = await I18n.translate('en', 'activity')
    WinnieClient.client.user?.setActivity(activity)
  }
}
