import { CommandInteraction } from 'discord.js'
import { CommandUtils } from '../utils'
import { GuildConfig } from '../../models'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'overwrite'

export const GoalOverwriteCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.overwrite.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'progress',
        description: await I18n.translate(locale, 'commands:goals.overwrite.args.progress'),
        type: 'INTEGER',
        required: true
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const goal = await GoalService.activeGoalForUser(interaction.user.id)
    if (goal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.overwrite.errors.noActiveGoal'))
      return
    }

    const newProgress = await progressOverwrite(interaction, guildConfig.locale)
    if (newProgress < 0) { return }

    goal.progress = newProgress
    await goal.save()
    if (goal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.overwrite.errors.couldNotOverwriteGoal'))
    } else {
      await interaction.reply(await goal.print(guildConfig.locale))
    }
  }
}

/**
  * Gets the progress overwrite value from the command arguments and
  * checks if the value is valid.
  *
  * @param interaction The interaction that was executed
  * @param locale the locale to use when looking up strings
  * @returns The progress overwrite if the number is valid, -1 if it's invalid
  */
async function progressOverwrite (interaction: CommandInteraction, locale: string): Promise<number> {
  const subcommand = interaction.options[0]
  const progressOption = subcommand.options?.find((option) => option.name === 'progress')
  if (progressOption == null) {
    await CommandUtils.printGenericError(interaction, locale)
    return -1
  }

  const progressOverwrite = progressOption.value as number

  if (progressOverwrite < 0) {
    await interaction.reply(await I18n.translate(locale, 'commands:goal.overwrite.errors.overwriteMustNotBeNegative', {
      progress: progressOverwrite
    }))
    return -1
  }

  return progressOverwrite
}