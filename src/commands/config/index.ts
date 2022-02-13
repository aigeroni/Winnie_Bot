import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { Command } from '../../types'
import { ConfigCrossGuildCommand } from './cross-guild'
import { ConfigTimezoneCommand } from './timezone'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core'
import { executeTopLevelCommand } from '../utils/execute-top-level-command'

const NAME = 'config'

const commands = [
  ConfigCrossGuildCommand,
  ConfigTimezoneCommand
]

export const ConfigCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:config.description'),
    options: [
      await ConfigCrossGuildCommand.commandData(locale),
      await ConfigTimezoneCommand.commandData(locale)
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => {
    await executeTopLevelCommand(commands, interaction, guildConfig, userConfig)
  }
}
