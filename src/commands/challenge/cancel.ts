import { CommandInteraction } from 'discord.js'
import { ChallengeController, GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'cancel'

export const ChallengeCancelCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.cancel.description'),
    type: 'SUB_COMMAND',
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
    const challengeId = interaction.options.getInteger('id')
    if (challengeId == null) { throw new Error() } // uh... yikes?

    const challengeController = await ChallengeController.findOne({ where: { id: challengeId } })
    const challenge = challengeController?.challenge()
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
