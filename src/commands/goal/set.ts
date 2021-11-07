import { CommandInteraction } from 'discord.js'
import { GuildConfig, UserConfig } from '../../models'
import { GoalCreateOptions, GoalDurations, GoalTypes, SubCommand } from '../../types'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { IANAZone } from 'luxon'

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
          name: type,
          value: type
        })),
        required: false
      },
      {
        name: 'duration',
        description: await I18n.translate(locale, 'commands:goal.set.args.duration'),
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
    if (await userHasActiveGoal(interaction, guildConfig.locale)) { return }

    const goalTimezone = await userTimezone(interaction, guildConfig)
    if (goalTimezone == null) { return }

    const goalOptions = getGoalOptions(interaction, goalTimezone)
    const goal = await GoalService.createGoal(goalOptions)

    if (goal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.set.error.couldNotCreateGoal'))
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
  const goalDuration = interaction.options.getString('duration') as GoalDurations ?? 'daily' as GoalDurations
  const goal = await GoalService.activeGoalForUser(interaction.user.id, goalDuration)

  if (goal != null) {
    await interaction.reply(await I18n.translate(locale, 'commands:goal.set.error.goalAlreadyActive', {
      goal: await goal.print(locale)
    }))
    return true
  } else {
    return false
  }
}

/**
  * The timezone of the user who executed the command.
  * If they do not have a timezone set, use the guild timezone.
  * If neither are set, prevent the user from creating a new goal.
  *
  * @param interaction The interaction that was executed
  * @param guildConfig The config object of the guild the interaction was run in.
  * @returns true if the user or guild does not have a timezone set.
  */
async function userTimezone (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<IANAZone | null> {
  const userConfig = await UserConfig.findOne(interaction.user.id)
  if (userConfig?.timezone != null) { return userConfig.timezone }
  if (guildConfig.timezone != null) { return guildConfig.timezone }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.set.error.timezoneNotSet'))
  return null
}

/**
   * Parses the arguments passed into the command.
   *
   * @param interaction The command that was ran
   * @param guildConfig The config object of the guild the interaction was run in.
   * @param userConfig The config object of the user who ran the command.
   * @returns An object containing the parameters for creating the goal
   */
function getGoalOptions (interaction: CommandInteraction, timezone: IANAZone): GoalCreateOptions {
  return {
    channelId: interaction.channel?.id,
    duration: interaction.options.getString('duration') as GoalDurations,
    ownerId: interaction.user?.id,
    target: interaction.options.getInteger('target') ?? 0,
    type: interaction.options.getString('type') as GoalTypes,
    progress: 0,
    timezone: timezone
  }
}
