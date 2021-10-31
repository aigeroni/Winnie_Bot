import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { ChallengeService } from '../../services'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'join'

export const ChallengeJoinCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.join.description'),
    type: 'SUB_COMMAND_GROUP',
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
    const joinedChallenge = await ChallengeService.userHasJoinedChallenge(interaction.user.id)
    if (joinedChallenge != null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.challengeAlreadyJoined'))
      return
    }

    await interaction.cancel(interaction.options.getBoolean('join'))

    if (interaction.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.error.couldNotJoinChallenge'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.join.success'))
    }
  }
}

