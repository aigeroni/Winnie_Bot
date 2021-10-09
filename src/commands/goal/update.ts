import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { GoalService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'update'

export const GoalUpdateCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:goal.update.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'progress',
        description: await I18n.translate(locale, 'commands:goal.update.args.progress'),
        type: 'INTEGER',
        required: true
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const goal = await GoalService.activeGoalForUser(interaction.user.id)
    if (goal == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.update.error.noActiveGoal'))
      return
    }

    const newProgress = await progressUpdate(interaction, guildConfig.locale)
    if (newProgress < 0) { return }

    goal.progress += newProgress
    await goal.save()
    if (goal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:goal.update.error.couldNotUpdateGoal'))
    } else {
      await interaction.reply(await goal.print(guildConfig.locale))
    }
  }
}

/**
  * Gets the progress update value from the command arguments and
  * checks if the value is valid.
  *
  * @param interaction The interaction that was executed
  * @param locale the locale to use when looking up strings
  * @returns The progress update if the number is valid, -1 if it's invalid
  */
async function progressUpdate (interaction: CommandInteraction, locale: string): Promise<number> {
  const progressUpdate = interaction.options.getInteger('progress', true)

  if (progressUpdate <= 0) {
    await interaction.reply(await I18n.translate(locale, 'commands:goal.update.error.updateMustBePositive', {
      progress: progressUpdate
    }))
    return -1
  }

  return progressUpdate
}
