import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { Command } from '../../types'
import { CommandUtils } from '../utils'
import { GoalCancelCommand } from './cancel'
import { GoalInfoCommand } from './info'
import { GoalOverwriteCommand } from './overwrite'
import { GoalResetCommand } from './reset'
import { GoalSetCommand } from './set'
import { GoalUpdateCommand } from './update'
import { GuildConfig } from '../../models'
import { executeTopLevelCommand } from '../utils/execute-top-level-command'
import { I18n } from '../../core'

const NAME = 'goal'

const commands = [
  GoalCancelCommand,
  GoalInfoCommand,
  GoalOverwriteCommand,
  GoalResetCommand,
  GoalSetCommand,
  GoalUpdateCommand
]

export const GoalCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:config.description'),
    options: [
      await GoalCancelCommand.commandData(locale),
      await GoalInfoCommand.commandData(locale),
      await GoalOverwriteCommand.commandData(locale),
      await GoalResetCommand.commandData(locale),
      await GoalSetCommand.commandData(locale),
      await GoalUpdateCommand.commandData(locale)
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    await executeTopLevelCommand(commands, interaction, guildConfig)
  }
}
