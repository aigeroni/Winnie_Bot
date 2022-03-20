import { CommandInteraction } from 'discord.js'
import { Goal, GuildConfig, UserConfig } from '../../models'
import { GoalDurations, SubCommand, TargetTypes } from '../../types'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { IANAZone } from 'luxon'

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
        required: true
      },
      {
        name: 'type',
        description: await I18n.translate(locale, 'commands:goal.reset.args.type'),
        type: 'STRING',
        choices: Object.values(TargetTypes).map((type) => ({
          name: type,
          value: type
        })),
        required: false
      },
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
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => {
    const goalDuration = interaction.options.getString('duration') as GoalDurations ?? GoalDurations.DAILY
    const oldGoal = await GoalService.activeGoalForUser(interaction.user.id, goalDuration)
    if (oldGoal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.reset.error.noActiveGoal'))
      return
    }

    const goalTimezone = await userTimezone(interaction, guildConfig, userConfig)
    if (goalTimezone == null) { return }

    const newGoalType = interaction.options.getString('type') as TargetTypes ?? TargetTypes.WORDS
    let goalProgress = 0
    if (newGoalType === oldGoal.goalType) {
      goalProgress = oldGoal.progress
    }

    await oldGoal.cancel()
    const newGoal = await createNewGoal(interaction, oldGoal, goalProgress, goalTimezone)

    if (oldGoal.errors.length > 0 && newGoal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.reset.error.couldNotResetGoal'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.reset.success', {
        goal: await newGoal.print(guildConfig.locale)
      }))
    }
  }
}

/**
  * The timezone of the user who executed the command.
  * If they do not have a timezone set, use the guild timezone.
  * If neither are set, prevent the user from creating a new goal.
  *
  * @param interaction The interaction that was executed
  * @param guildConfig The config object of the guild the interaction was run in.
  * @param userConfig The config object of the user that executed the command.
  * @returns true if the user or guild does not have a timezone set.
  */
async function userTimezone (interaction: CommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig): Promise<IANAZone | null> {
  if (userConfig?.timezone != null) { return userConfig.timezone }
  if (guildConfig.timezone != null) { return guildConfig.timezone }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.set.error.timezoneNotSet'))
  return null
}

/**
 * Creates a new goal using the options passed to the command. Options
 * not passed as a command argument fall back to the original goal's value.
 *
 * @param oldGoal The original goal being reset
 * @param newGoalOptions The new goal options passed to the command
 * @returns The newly created goal.
 */
async function createNewGoal (interaction: CommandInteraction, oldGoal: Goal, progress: number, timezone: IANAZone): Promise<Goal> {
  return await GoalService.createGoal({
    guildId: interaction.guild?.id,
    ownerId: oldGoal.ownerId,
    target: interaction.options.getInteger('target') ?? oldGoal.target,
    type: interaction.options.getString('type') as TargetTypes ?? oldGoal.goalType,
    progress: progress,
    duration: interaction.options.getString('duration') as GoalDurations ?? oldGoal.goalDuration,
    channelId: interaction.channel?.id ?? oldGoal.channelId,
    timezone
  })
}
