import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { ChallengeCancelCommand } from './cancel'
import { ChallengeFinishCommand } from './finish'
import { ChallengeJoinCommand } from './join'
import { ChallengeLeaveCommand } from './leave'
import { ChallengeStartCommand } from './start'
import { ChallengeStatusCommand } from './status'
import { ChallengeTotalCommand } from './total'
import { Command } from '../../types'
import { CommandUtils } from '../utils'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core'

const NAME = 'challenge'

const commands = [
  ChallengeCancelCommand,
  ChallengeFinishCommand,
  ChallengeJoinCommand,
  ChallengeLeaveCommand,
  ChallengeStartCommand,
  ChallengeStatusCommand,
  ChallengeTotalCommand
]

export const ChallengeCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.description'),
    options: [
      await ChallengeCancelCommand.commandData(locale),
      await ChallengeFinishCommand.commandData(locale),
      await ChallengeJoinCommand.commandData(locale),
      await ChallengeLeaveCommand.commandData(locale),
      await ChallengeStartCommand.commandData(locale),
      await ChallengeStatusCommand.commandData(locale),
      await ChallengeTotalCommand.commandData(locale)
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => {
    await CommandUtils.executeTopLevelCommand(commands, interaction, guildConfig, userConfig)
  }
}