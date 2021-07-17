import { CommandInteraction } from 'discord.js'
import { GoalService } from '../../services'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'info'

export const GoalInfoCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.info.description'),
    type: 'SUB_COMMAND'
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const goal = await GoalService.activeGoalForUser(interaction.user.id)
    if (goal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.info.errors.noActiveGoal'))
      return
    }

    await interaction.reply(await goal.print(guildConfig.locale))
  }
}
