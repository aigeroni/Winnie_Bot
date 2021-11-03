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
    const challengeId = interaction.options.getInteger('id')
    let challenge: Challenge | undefined

    if (challengeId == null) {
      challenge = await ChallengeService.activeChallengeForUser(interaction.user.id)

      if (challenge == null) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.noChallengeSpecified'))
        return
      }
    } else {
      challenge = (await ChallengeController.findOne({ where: { id: interaction.options.getInteger('id') } }))?.challenge()
    }

    if (challenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
      return
    }

    await printStatus(challenge, interaction, guildConfig)
  }
}

async function printStatus (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.challengeDoesNotExist'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status'))
  }
}
