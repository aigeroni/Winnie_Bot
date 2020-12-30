import { Command } from '../types/command'
import { Event } from '../types/event'
import { GuildConfig } from '../models'
import { I18n } from '../core/i18n'
import { Logger } from '../core/logger'
import { Message } from 'discord.js'
import { WinnieClient } from '../core/winnie-client'

declare const Commands: {
  commandList: Array<Command>
}

/**
 * Check the given message to see if the Winnie_Bot user was mentioned.
 * If so responds to the message with a help message.
 *
 * @param message The message containing the message
 * @param client the Winnie_Bot instance
 */
async function handleMention(message: Message, guildConfig: GuildConfig): Promise<void> {
  if (!WinnieClient.client.user) { return }
  if (!message.mentions.has(WinnieClient.client.user?.id)) { return }

  const response = await I18n.translate('en', 'mentionResponse', { prefix: guildConfig.prefix })
  message.channel.send(response)
}

/**
 * Checks to see if the message contains a command, if so, runs the command
 *
 * @param message The message containing the message
 * @param guildConfig the Winnie_Bot instance
 */
async function handleCommand(message: Message, guildConfig: GuildConfig): Promise<void> {
  if (!message.content.startsWith(guildConfig.prefix)) { return }

  const commandName = message.content
    .split(/ +/) // Split the message, at spaces, into an array of strings
    .shift() // Grab the first string out of the content array
    ?.slice(guildConfig.prefix.length) // Remove the command prefix from the command name
    ?.toLowerCase() // Convert the command name to lowercase for case insensitive matching

  if (!commandName) { return }

  const command = Commands.commandList.find((command) => {
    return command.name === commandName || command.aliases?.includes(commandName)
  })

  if (!command) { return }

  try {
    await command.execute(message, guildConfig)
  } catch (error) {
    Logger.error(`An error occured executing the command \`${command.name}\`:\n${error}`)
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
    if (!message.guild) { return } // Ignore direct messages.
    if (message.author.bot) { return } // Ignore messages from bots

    const guildConfig = await GuildConfig.findOrCreate(message.guild?.id)
    if (!guildConfig) { return }

    handleMention(message, guildConfig)
    //handleCommand(message, guildConfig)
  },
}
