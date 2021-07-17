import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { Command } from '../../types'
import { CommandUtils } from '../utils'
import { GoalInfoCommand } from './info'
import { GoalSetCommand } from './set'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'

const NAME = 'goal'

const commands = [
  GoalInfoCommand,
  GoalSetCommand
]

export const GoalCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:config.description'),
    options: [
      await GoalInfoCommand.commandData(locale),
      await GoalSetCommand.commandData(locale)
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    await CommandUtils.executeTopLevelCommand(commands, interaction, guildConfig)
  }
}
