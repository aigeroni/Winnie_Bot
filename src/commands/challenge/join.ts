import { ChallengeService } from '../../services'
import { ChallengeTotal, GuildConfig } from '../../models'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../../core'
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
    const activeChallenge = await ChallengeService.activeChallengeForUser(interaction.user.id)
    if (activeChallenge != null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.challengeAlreadyJoined'))
      return
    }

    const challenge = await ChallengeService.getChallengeFromCommand(interaction, guildConfig)
    if (challenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.challengeDoesNotExist'))
      return
    }

    const channelAdd = await ChallengeService.addChannelToChallenge(interaction.channelId, challenge)
    if (channelAdd.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
    }

    if (interaction.guildId == null) { return }
    const guildId = interaction.guildId

    const userId = interaction.user.id
    const challengeTotal = await ChallengeTotal.findOne({
      where: { userId: userId, challenge: challengeId }
    })
    if (challengeTotal != null) {
      await challengeTotal.rejoin(channelId, guildId)
    } else {
      const userAdd = await ChallengeService.addUserToChallenge(userId, challengeId, channelId)
      if (userAdd.errors.length > 0) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
        return
      }
    }
    const challengeName = challenge.name
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.success', {
      challengeName: challengeName ?? '',
      id: challengeId
    }))
  }
}
