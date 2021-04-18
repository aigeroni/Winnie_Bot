import { Commands } from '../commands'
import { Event } from '../types/event'
import { GuildConfig } from '../models'
import { I18n } from '../core/i18n'
import { Logger } from '../core/logger'
import { Message } from 'discord.js'
import { WinnieClient } from '../core/winnie-client'

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

  const response = await I18n.translate('en', 'mentionResponse', { prefix: guildConfig.prefix })
  await message.channel.send(response)
}

/**
 * Checks to see if the message contains a command, if so, runs the command
 *
 * @param message The message containing the message
 * @param guildConfig the Winnie_Bot instance
 */
async function handleCommand (message: Message, guildConfig: GuildConfig): Promise<void> {
  if (!message.content.startsWith(guildConfig.prefix)) { return }

  const commandName = message.content
    .split(/ +/) // Split the message, at spaces, into an array of strings
    .shift() // Grab the first string out of the content array
    ?.slice(guildConfig.prefix.length) // Remove the command prefix from the command name
    ?.toLowerCase() // Convert the command name to lowercase for case insensitive matching

  if (commandName == null) { return }

  const command = Commands.commandList.find((command) => {
    return command.name === commandName || command.aliases?.includes(commandName)
  })

  if (command == null) { return }
  if (message.member == null) { return }
  if ((command.requiredPermissions != null) && !message.member.permissions.has(command.requiredPermissions)) { return }

  try {
    await command.execute(message, guildConfig)
  } catch (error) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:defaultError'))
    const errorMessage: string = error.toString()
    Logger.error(`An error occured executing the command \`${command.name}\`:\n${errorMessage}`)
  }
}

/**
 * Handles the message event, fired whenever a user posts a new message.
 *
 * Used for:
 *  - Responding to mentions with a help message
 *  - Processing commands
 */
export const MessageEvent: Event = {
  name: 'message',
  handle: async (message: Message): Promise<void> => {
    if (message.guild == null) { return } // Ignore direct messages.
    if (message.author.bot) { return } // Ignore messages from bots

    const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
    if (guildConfig == null) { return }

    await handleMention(message, guildConfig)
    await handleCommand(message, guildConfig)
  }
}
