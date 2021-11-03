import { CommandInteraction } from 'discord.js'
import { ChallengeController, ChallengeUser, GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand } from '../../types'
import { ChallengeService } from '../../services'
import { InteractionResponseTypes } from 'discord.js/typings/enums'

const NAME = 'leave'

export const ChallengeLeaveCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.leave.description'),
    type: 'SUB_COMMAND'
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const activeChallenge = await ChallengeService.activeChallengeForUser(interaction.user.id)
    if (activeChallenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.error.noActiveChallenge'))
      return
    }

    const challengeController = await ChallengeController.findOne({ where: { id: activeChallenge.id } })

    const challengeUser = await ChallengeUser.findOne({
      where: { userId: interaction.user.id, challengeController: challengeController }
    })
    if (challengeUser == null || challengeUser.isCanceled()) {
      throw new Error() // I don't think this is actually a possible state
    }

    await challengeUser.cancel()

    if (challengeUser.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.error.couldNotLeaveChallenge'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.success'))
    }
  }
}
