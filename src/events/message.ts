import { Event } from './event'
import { GuildConfig } from '../models'
import { I18n } from '../core/i18n'
import { Message } from 'discord.js'
import { WinnieClient } from '../core/winnie-client'

/**
 * Check the given message to see if the Winnie_Bot user was mentioned.
 * If so responds to the message with a help message.
 *
 * @param message The message containing the message
 * @param client the Winnie_Bot instance
 */
async function handleMention(message: Message): Promise<void> {
  if (!WinnieClient.client.user) { return }
  if (!message.guild) { return }
  if (!message.mentions.has(WinnieClient.client.user?.id)) { return }

  const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
  if (!guildConfig) { return }

  const response = await I18n.translate('en', 'mentionResponse', { prefix: guildConfig.prefix })
  message.channel.send(response)
}

/**
 * Handles the message event, fired whenever a user posts a new message.
 *
 * Used for:
 *  - Responding to mentions with a help message
 */
export const MessageEvent: Event = {
  name: 'message',
  handle: async (message: Message): Promise<void> => {
    handleMention(message)
  },
}
