import { CommandInteraction } from 'discord.js'
import { Goal, GuildConfig } from '../../models'
import { GoalCreateOptions, GoalDurations, GoalTypes, SubCommand } from '../../types'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { DateTime } from 'luxon'

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
        description: await I18n.translate(locale, 'commands:goals.reset.args.target'),
        type: 'INTEGER',
        required: false
      },
      {
        name: 'type',
        description: await I18n.translate(locale, 'commands:goals.reset.args.type'),
        type: 'STRING',
        choices: Object.values(GoalTypes).map((type) => ({
          name: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
          value: type
        })),
        required: false
      },
      {
        name: 'duration',
        description: await I18n.translate(locale, 'commands:goals.reset.args.duration'),
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

    oldGoal.canceledAt = DateTime.local()

    const resetOptions = getGoalOptions(interaction)
    const newGoal = await createNewGoal(oldGoal, resetOptions)

    await oldGoal.save()

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
async function createNewGoal (oldGoal: Goal, newGoalOptions: GoalCreateOptions): Promise<Goal> {
  return await GoalService.createGoal({
    ownerId: oldGoal.ownerId,
    target: newGoalOptions.target ?? oldGoal.target,
    type: newGoalOptions.type ?? oldGoal.goalType,
    duration: newGoalOptions.duration ?? oldGoal.goalDuration,
    channelId: newGoalOptions.channelId ?? oldGoal.channelId
  })
}

/**
   * Parses the arguments passed into the command.
   *
   * @param interaction The command that was ran
   * @returns An object containing the parameters for creating the goal
   */
function getGoalOptions (interaction: CommandInteraction): GoalCreateOptions {
  const subcommand = interaction.options[0]
  const targetOption = subcommand.options?.find((option) => option.name === 'target')
  const typeOption = subcommand.options?.find((option) => option.name === 'type')
  const durationOption = subcommand.options?.find((option) => option.name === 'duration')

  return {
    channelId: interaction.channel?.id,
    duration: durationOption?.value as GoalDurations,
    target: targetOption?.value as number,
    type: typeOption?.value as GoalTypes
  }
}
