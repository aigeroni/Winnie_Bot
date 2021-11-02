import { CommandUtils } from '../commands/utils'
import { Event } from '../types'
import { GuildConfig } from '../models'
import { I18n, WinnieClient } from '../core'
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
  if (!message.mentions.has(WinnieClient.client.user?.id)) { return }

  const response = await I18n.translate('en', 'mentionResponse')
  await message.channel.send(response)
}

async function deployCommands (message: Message, guildConfig: GuildConfig): Promise<void> {
  if (message.content !== '!deployWinnieCommands') { return }
  if (process.env.USERS_WHO_CAN_DEPLOY == null) { return }
  if (!process.env.USERS_WHO_CAN_DEPLOY.includes(message.author.id)) { return }

  await CommandUtils.deployCommands(guildConfig)
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
    if (message.guild == null) { return } // Ignore direct messages.
    if (message.author.bot) { return } // Ignore messages from bots

    const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
    if (guildConfig == null) { return }

    await handleMention(message, guildConfig)
    await deployCommands(message, guildConfig)
  }
}
