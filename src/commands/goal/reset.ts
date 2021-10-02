import { CommandInteraction } from 'discord.js'
import { Goal, GuildConfig } from '../../models'
import { GoalDurations, GoalTypes, SubCommand } from '../../types'
import { GoalService } from '../../services'
import { I18n } from '../../core'

const NAME = 'reset'

export const GoalResetCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.reset.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'target',
        description: await I18n.translate(locale, 'commands:goal.reset.args.target'),
        type: 'INTEGER',
        required: false
      },
      {
        name: 'type',
        description: await I18n.translate(locale, 'commands:goal.reset.args.type'),
        type: 'STRING',
        choices: Object.values(GoalTypes).map((type) => ({
          name: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
          value: type
        })),
        required: false
      },
      {
        name: 'duration',
        description: await I18n.translate(locale, 'commands:goal.reset.args.duration'),
        type: 'STRING',
        choices: Object.values(GoalDurations).map((duration) => ({
          name: `${duration.charAt(0).toUpperCase()}${duration.slice(1)}`,
          value: duration
        })),
        required: false
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const oldGoal = await GoalService.activeGoalForUser(interaction.user.id)
    if (oldGoal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.reset.errors.noActiveGoal'))
      return
    }

    await oldGoal.cancel()
    const newGoal = await createNewGoal(interaction, oldGoal)

    if (oldGoal.errors.length > 0 && newGoal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.reset.errors.couldNotResetGoal'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.reset.success', {
        goal: await newGoal.print(guildConfig.locale)
      }))
    }
  }
}

/**
 * Creates a new goal using the options passed to the command. Options
 * not passed as a command argument fall back to the original goal's value.
 *
 * @param oldGoal The original goal being reset
 * @param newGoalOptions The new goal options passed to the command
 * @returns The newly created goal.
 */
async function createNewGoal (interaction: CommandInteraction, oldGoal: Goal): Promise<Goal> {
  return await GoalService.createGoal({
    ownerId: oldGoal.ownerId,
    target: interaction.options.getInteger('target') ?? oldGoal.target,
    type: interaction.options.getString('type') as GoalTypes ?? oldGoal.goalType,
    duration: interaction.options.getString('duration') as GoalDurations ?? oldGoal.goalDuration,
    channelId: interaction.channel?.id ?? oldGoal.channelId
  })
}
