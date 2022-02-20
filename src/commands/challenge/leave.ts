import { ChallengeService } from '../../services'
import { ChallengeTotal, GuildConfig } from '../../models'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../../core'
import { StatusTypes, SubCommand } from '../../types'

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

    const challengeTotal = await ChallengeTotal.findOne({
      where: { userId: interaction.user.id, challenge: activeChallenge }
    })
    if (challengeTotal == null || challengeTotal.status === StatusTypes.CANCELED) {
      throw new Error() // I don't think this is actually a possible state
    }

    await challengeTotal.cancel()

    if (challengeTotal.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.error.couldNotLeaveChallenge'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.leave.success'))
    }
  }
}
