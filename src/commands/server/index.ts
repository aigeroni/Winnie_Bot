import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { Message } from 'discord.js'
import { ServerAnnouncementsChannelCommand } from './announcements-channel'
import { ServerCrossGuildCommand } from './cross-guild'
import { ServerLocaleCommand } from './locale'
import { ServerPrefixCommand } from './prefix'
import { ServerTimezoneCommand } from './timezone'

const subcommands = [
  ServerAnnouncementsChannelCommand,
  ServerCrossGuildCommand,
  ServerLocaleCommand,
  ServerPrefixCommand,
  ServerTimezoneCommand
]

/**
 * The config command is used for doing basic CRUD operations
 * for guild configuration
 */
export const ServerConfigCommand: Command = {
  name: 'server',
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
    if (command.requiredPermissions != null && !message.member.permissions.has(command.requiredPermissions)) { return }

    await command.execute(message, guildConfig)
  }
}
