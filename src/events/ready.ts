import I18n from '../core/i18n'
import Logger from '../core/logger'
import { Client } from 'discord.js'
import { Event } from '../core/types'
import { createConnection } from 'typeorm'

const ReadyEvent: Event = {
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

export default ReadyEvent
