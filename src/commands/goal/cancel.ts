import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { GoalDurations, SubCommand } from '../../types'

const NAME = 'cancel'

export const GoalCancelCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.cancel.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'duration',
        description: await I18n.translate(locale, 'commands:goal.reset.args.duration'),
        type: 'STRING',
        choices: Object.values(GoalDurations).map((duration) => ({
          name: duration,
          value: duration
        })),
        required: false
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const goalDuration = interaction.options.getString('duration') as GoalDurations ?? GoalDurations.DAILY
    const goal = await GoalService.activeGoalForUser(interaction.user.id, goalDuration)
    if (goal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.cancel.error.noActiveGoal'))
      return
    }

    await goal.cancel()

    if (goal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.cancel.error.couldNotCancelGoal'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.cancel.success'))
    }
  }
}
