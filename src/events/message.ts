import { Client, Message } from 'discord.js'
import { Event } from './event'
import { GuildConfig } from '../models'
import { I18n } from '../core/i18n'

/**
 * Check the given message to see if the Winnie_Bot user was mentioned.
 * If so resonds to the message with a help message.
 *
 * @param message The message containing the message
 * @param client the Winnie_Bot instance
 */
async function handleMention(message: Message, client: Client): Promise<void> {
  if (!client.user) { return }
  if (!message.guild) { return }
  if (!message.mentions.has(client.user?.id)) { return }

  const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
  if (!guildConfig) { return }

  const response = await I18n.translate('en', 'mentionResponse', { prefix: guildConfig.prefix })
  message.channel.send(response)
}

/**
 * Handles the message event, fired whenever a user posts a new message.
 *
 * Used for:
 *  - Responsding to mentions with a help message
 */
export const MessageEvent: Event = {
  name: 'message',
  handle: async (message: Message, client: Client): Promise<void> => {
    handleMention(message, client)
  },
}
