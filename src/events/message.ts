import { CommandUtils } from '../commands/utils'
import { Event } from '../types'
import { GuildConfig } from '../models'
import { I18n, Logger, WinnieClient } from '../core'
import { Message, Permissions } from 'discord.js'

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
  Logger.info('Winnie successfully registered mention')

  const response = await I18n.translate(guildConfig.locale, 'mentionResponse')
  await message.channel.send(response)
  Logger.info('attempting to deploy commands')
  await deployCommands(message, guildConfig)
}

async function deployCommands (message: Message, guildConfig: GuildConfig): Promise<void> {
  const author = message.member
  if (author == null) { return }

  if (author.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    try {
      await CommandUtils.deployCommands(guildConfig)
    } catch {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:deploy.error'))
      return
    }

    await message.reply(await I18n.translate(guildConfig.locale, 'commands:deploy.success'))
  }
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
  }
}
