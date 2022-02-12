import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { Command } from '../../types'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { ServerAnnouncementsChannelCommand } from './announcement-channel'
import { ServerCrossGuildCommand } from './cross-guild'
import { ServerLocaleCommand } from './locale'
import { ServerTimezoneCommand } from './timezone'
import { executeTopLevelCommand } from '../utils/execute-top-level-command'

const NAME = 'server'

const commands = [
  ServerAnnouncementsChannelCommand,
  ServerCrossGuildCommand,
  ServerLocaleCommand,
  ServerTimezoneCommand
]

export const ServerCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:server.description'),
    options: [
      await ServerAnnouncementsChannelCommand.commandData(locale),
      await ServerCrossGuildCommand.commandData(locale),
      await ServerLocaleCommand.commandData(locale),
      await ServerTimezoneCommand.commandData(locale)
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => {
    await executeTopLevelCommand(commands, interaction, guildConfig, userConfig)
  }
}
