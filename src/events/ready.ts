import I18n from '../core/i18n'
import { Client } from 'discord.js'
import { Event } from '../core/types'

const ReadyEvent: Event = {
  name: 'ready',
  handle: async (client: Client) => {
    const activity = await I18n.translate('en', 'activity')
    client.user?.setActivity(activity)
  },
}

export default ReadyEvent
