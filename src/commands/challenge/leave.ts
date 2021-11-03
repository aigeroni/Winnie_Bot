import { CommandInteraction } from 'discord.js'
import { ChallengeController, ChallengeUser, GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'leave'

export const ChallengeLeaveCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.leave.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.leave.id.description'),
        type: 'INTEGER',
        required: true
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const challengeId = interaction.options.getInteger('id')
    const userId = interaction.user?.id
    if (challengeId == null) { throw new Error() } // uh... yikes?

    const challengeController = await ChallengeController.findOne({ where: { id: challengeId } })
    const challenge = challengeController?.challenge()
    if (challenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.error.challengeDoesNotExist'))
      return
    }

    const challengeUser = await ChallengeUser.findOne({
      where: { userId: userId, challengeController: challengeId }
    })
    if (challengeUser == null || challengeUser.isCanceled()) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.error.challengeDoesNotExist'))
      return
    }

    await challengeUser.cancel()

    if (challengeUser.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.error.couldNotLeaveChallenge'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.success'))
    }
  }
}
