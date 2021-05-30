import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { I18n } from '../../core/i18n'
import { GuildConfig } from '../../models'
import { Command } from '../../types/command'
import { executeTopLevelCommand } from '../utils/execute-top-level-command'
import { ConfigCrossGuildCommand } from './cross-guild'
import { ConfigTimezoneCommand } from './timezone'

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
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    await executeTopLevelCommand(commands, interaction, guildConfig)
  }
}
