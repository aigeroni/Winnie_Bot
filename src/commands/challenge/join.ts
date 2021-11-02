import { CommandInteraction } from 'discord.js'
import { GuildConfig, ChallengeChannel, ChallengeController, ChallengeUser } from '../../models'
import { ChallengeService } from '../../services'
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
        description: await I18n.translate(locale, 'commands:challenge.join.id.description'),
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

    const challengeId = interaction.options.getInteger('id')
    if (challengeId == null) { throw new Error() } // uh.... yikes?

    const challengeController = await ChallengeController.findOne({ where: { id: challengeId } })
    if (challengeController == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.cancel.error.challengeDoesNotExist'))
      return
    }

    const channelId = interaction.channelId
    let channelAdd = null
    const challengeChannel = await ChallengeChannel.findOne({
      where: { channelId: channelId, challengeController: challengeId }
    })
    if (challengeChannel == null) {
      channelAdd = await ChallengeService.addChannelToChallenge(interaction.channelId, challengeId)
      if ( channelAdd.errors.length > 0) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
      }
    }

    const userId = interaction.user.id
    const challengeUser = await ChallengeUser.findOne({
      where: { userId: userId, challengeController: challengeId }
    })
    if (challengeUser != null) {
      await challengeUser.rejoin(channelId)
    } else {
      const userAdd = await ChallengeService.addUserToChallenge(userId, challengeId, channelId)
      if (userAdd.errors.length > 0 ) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
        return
      }
    }
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.success'))
  }
}
