import I18n from '../core/i18n'
import { Client, Message } from 'discord.js'
import { Event } from '../core/types'
import { GuildConfig } from '../models'

const MessageEvent: Event = {
  name: 'message',
  handle: async (message: Message, client: Client): Promise<void> => {
    if (!client.user) { return }
    if (!message.guild) { return }
    if (!message.mentions.has(client.user?.id)) { return }

    const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
    if (!guildConfig) { return }

    const response = await I18n.translate('en', 'mentionResponse', { prefix: guildConfig.prefix })
    message.channel.send(response)
  },
}

export default MessageEvent
