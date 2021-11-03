import { CommandInteraction } from 'discord.js'
import { GoalService } from '../../services'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { GoalDurations, SubCommand } from '../../types'

const NAME = 'info'

export const GoalInfoCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.info.description'),
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
    const goalDuration = interaction.options.getString('duration') as GoalDurations
    const goal = await GoalService.activeGoalForUser(interaction.user.id, goalDuration)
    if (goal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.info.error.noActiveGoal'))
      return
    }

    await interaction.reply(await goal.print(guildConfig.locale))
  }
}
