import { Command } from '../../types/command'
import { ConfigCrossGuildCommand } from './cross-guild'
import { ConfigTimezoneCommand } from './timezone'
import { GuildConfig } from '../../models'
import { Message } from 'discord.js'

const subcommands = [
  ConfigCrossGuildCommand,
  ConfigTimezoneCommand
]

/**
 * The config command is used for doing basic CRUD operations
 * for user configuration
 */
export const ConfigCommand: Command = {
  name: 'config',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandName = message.content
      .split(/ +/)[1] // Split the message, at spaces, into an array of strings and grab the second element
      ?.toLowerCase() // Convert the subcommand name to lowercase for case insensitive matching

    if (commandName == null) { return }

    const command = subcommands.find((command) => {
      return command.name === commandName || command.aliases?.includes(commandName)
    })

    if (command == null) { return }
    if (message.member == null) { return }
    if ((command.requiredPermissions != null) && !message.member.permissions.has(command.requiredPermissions)) { return }

    await command.execute(message, guildConfig)
  }
}
