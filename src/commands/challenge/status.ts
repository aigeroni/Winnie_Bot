import { CommandInteraction } from 'discord.js'
import { Challenge, GuildConfig, ChallengeController } from '../../models'
import { ChallengeService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'status'

export const ChallengeStatusCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.status.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.status.id.description'),
        type: 'INTEGER',
        required: false
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    if (interaction.options.getInteger('id') == null) {
      // if id is null, add total to joined challenge
      const activeChallenge = await ChallengeService.activeChallengeForUser(interaction.user.id)
      if (activeChallenge == null) {
        // fail on not exist
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.noChallengeSpecified'))
      } else {
        await printStatus(activeChallenge, interaction, guildConfig)
      }
    } else {
    // if id is not null, add total to challenge by ID
      const challengeController = await ChallengeController.findOne({ where: { id: interaction.options.getInteger('id') } })
      if (challengeController !== undefined) {
        await printStatus(challengeController!.challenge(), interaction, guildConfig)
      } else {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.challengeDoesNotExist'))
      }
    }
  }
}

async function printStatus (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.challengeDoesNotExist'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status'))
  }
}
