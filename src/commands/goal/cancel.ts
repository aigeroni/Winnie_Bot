import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'
import { DateTime } from 'luxon'

const NAME = 'cancel'

export const GoalCancelCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.cancel.description'),
    type: 'SUB_COMMAND'
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const goal = await GoalService.activeGoalForUser(interaction.user.id)
    if (goal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.cancel.errors.noActiveGoal'))
      return
    }

    goal.canceledAt = DateTime.local()
    await goal.save()
    if (goal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.cancel.errors.couldNotCancelGoal'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.cancel.success'))
    }
  }
}
