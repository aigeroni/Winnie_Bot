import { Event } from '../types'
import { GuildConfig } from '../models'
import { I18n, Logger, WinnieClient } from '../core'
import { Message } from 'discord.js'

/**
 * Check the given message to see if the Winnie_Bot user was mentioned.
 * If so responds to the message with a help message.
 *
 * @param message The message containing the message
 * @param client the Winnie_Bot instance
 */
async function handleMention (message: Message, guildConfig: GuildConfig): Promise<void> {
  if (WinnieClient.client.user == null) { return }
  if (!message.mentions.has(WinnieClient.client.user, { ignoreEveryone: true, ignoreRoles: true })) { return }

  const response = await I18n.translate(guildConfig.locale, 'mentionResponse')
  await message.channel.send(response)
  Logger.info('Winnie registered mention. Attempting to deploy commands.')
}

/**
 * Handles the message event, fired whenever a user posts a new message.
 *
 * Used for:
 *  - Responding to mentions with a help message
 */
export const MessageEvent: Event = {
  name: 'message',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  handle: async (message: Message): Promise<void> => {
    if (message.guild == null) { return } // Ignore direct messages.
    if (message.author.bot) { return } // Ignore messages from bots

    const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
    if (guildConfig == null) { return }

    await handleMention(message, guildConfig)
  }
}
