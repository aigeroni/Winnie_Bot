import { CommandInteraction } from 'discord.js'
import { GuildConfig, UserConfig } from '../../models'
import { GoalCreateOptions, GoalDurations, GoalTypes, SubCommand } from '../../types'
import { GoalService } from '../../services'
import { I18n } from '../../core'

const NAME = 'set'

export const GoalSetCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.set.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'target',
        description: await I18n.translate(locale, 'commands:goal.set.args.target'),
        type: 'INTEGER',
        required: true
      },
      {
        name: 'type',
        description: await I18n.translate(locale, 'commands:goal.set.args.type'),
        type: 'STRING',
        choices: Object.values(GoalTypes).map((type) => ({
          name: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
          value: type
        })),
        required: false
      },
      {
        name: 'duration',
        description: await I18n.translate(locale, 'commands:goal.set.args.duration'),
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
    if (await userHasActiveGoal(interaction, guildConfig.locale)) { return }
    if (await userHasNoTimezoneSet(interaction, guildConfig)) { return }

    const goalOptions = getGoalOptions(interaction)
    const goal = await GoalService.createGoal(goalOptions)

    if (goal.errors.length > 0) {
      await interaction.reply(`${goal.ownerId} -- ${goal.channelId}`)
      // await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.set.errors.couldNotCreateGoal'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.set.success', {
        goal: await goal.print(guildConfig.locale)
      }))
    }
  }
}

/**
  * Checks if the user who executed the command has a currently active goal.
  * If they do have a goal, we do not want the to be allowed to create a new goal.
  *
  * @param interaction The interaction that was executed
  * @param locale the locale to use when looking up strings
  * @returns true if the user has an active goal.
  */
async function userHasActiveGoal (interaction: CommandInteraction, locale: string): Promise<boolean> {
  const goal = await GoalService.activeGoalForUser(interaction.user.id)

  if (goal != null) {
    await interaction.reply(await I18n.translate(locale, 'commands:goal.set.errors.goalAlreadyActive', {
      goal: await goal.print(locale)
    }))
    return true
  } else {
    return false
  }
}

/**
  * Checks if the user who executed the command has a timezone set.
  * If they do not have a timezone set, check if the guild has a timezone set.
  * If neither are set, prevent the user from creating a new goal.
  *
  * @param interaction The interaction that was executed
  * @param guildConfig The config object of the guild the interaction was run in.
  * @returns true if the user or guild does not have a timezone set.
  */
async function userHasNoTimezoneSet (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<boolean> {
  const userConfig = await UserConfig.findOne(interaction.user.id)

  if (userConfig?.timezone != null) { return false }
  if (guildConfig.timezone != null) { return false }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.set.errors.timezoneNotSet'))
  return true
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
    ownerId: interaction.user?.id,
    target: targetOption?.value as number ?? 0,
    type: typeOption?.value as GoalTypes
  }
}
