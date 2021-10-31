import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { ChallengeService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'cancel'

export const ChallengeCancelCommand: SubCommand = {
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.cancel.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.cancel.id.description'),
        type: 'INTEGER',
        required: true
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const challenge = await ChallengeService.getChallengeById(interaction.options.getInteger('id'))
    if (challenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.cancel.error.challengeDoesNotExist'))
      return
    }

    await challenge.cancel()

    if (challenge.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.cancel.error.couldNotCancelChallenge'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.cancel.success'))
    }
  }
}