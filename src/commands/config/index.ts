import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { Message } from 'discord.js'

declare const subcommands: Array<Command>

export const ConfigCommand: Command = {
  name: 'config',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandName = message.content
      .split(/ +/)[1] // Split the message, at spaces, into an array of strings and grab the second element
      ?.toLowerCase() // Convert the subcommand name to lowercase for case insensitive matching

    if (!commandName) { return }

    const command = subcommands.find((command) => {
      return command.name === commandName || command.aliases?.includes(commandName)
    })

    if (!command) { return }
    if (command.requiredPermissions && !message.member?.permissions.has(command.requiredPermissions)) { return }

    await command.execute(message, guildConfig)
  },
}
