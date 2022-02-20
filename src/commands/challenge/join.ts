import { ChallengeChannel, ChallengeTotal, GuildConfig } from '../../models'
import { ChallengeService } from '../../services'
import { CommandInteraction } from 'discord.js'
import { I18n, Logger } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'join'

export const ChallengeJoinCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.join.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.join.args.id'),
        type: 'INTEGER',
        required: true
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    Logger.info('active challenge pull')
    const activeChallenge = await ChallengeService.activeChallengeForUser(interaction.user.id)
    if (activeChallenge != null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.challengeAlreadyJoined'))
      return
    }

    Logger.info('challenge pull')
    const challengeId = interaction.options.getInteger('id')
    if (challengeId == null) { throw new Error() } // uh.... yikes?

    const channelId = interaction.channelId
    let channelAdd = null
    const challengeChannel = await ChallengeChannel.findOne({
      where: { channelId: channelId, challengeController: challengeId }
    })
    if (challengeChannel == null) {
      channelAdd = await ChallengeService.addChannelToChallenge(interaction.channelId, challengeId)
      if (channelAdd.errors.length > 0) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
      }
    }

    const userId = interaction.user.id
    const challengeTotal = await ChallengeTotal.findOne({
      where: { userId: userId, challenge: challengeId }
    })
    if (challengeTotal != null) {
      await challengeTotal.rejoin(channelId)
    } else {
      const userAdd = await ChallengeService.addUserToChallenge(userId, challengeId, channelId)
      if (userAdd.errors.length > 0) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
        return
      }
    }
    const challengeName = challenge.challenge()?.name
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.success', {
      challengeName: challengeName ?? '',
      id: challengeId
    }))
  }
}
