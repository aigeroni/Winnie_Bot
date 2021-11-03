import { CommandInteraction } from 'discord.js'
import { Challenge, GuildConfig, ChallengeController, ChallengeUser } from '../../models'
import { ChallengeService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'status'

export const ChallengeStatusCommand: SubCommand = {
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
        required: false
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    if (interaction.options.getInteger('id') == null ) {
      // if id is null, add total to joined challenge
      const activeChallenge = await ChallengeService.activeChallengeForUser(interaction.user.id)
      if (activeChallenge == null) {
        // fail on not exist
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.noChallengeSpecified'))
        return
      } else {
        await printStatus(activeChallenge, interaction, guildConfig)
      }
    } else {
    // if id is not null, add total to challenge by ID
    const challengeController = await ChallengeController.findOne({ where: { id: interaction.options.getInteger('id') } })
      if (challengeController.errors.length > 0) {
          // fail on not exist
          await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
          return
      } else {
        await printStatus(challengeController.challenge(), interaction, guildConfig)
      }
    }
  }
}

async function printStatus(challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
    return
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status'))
  }
}
