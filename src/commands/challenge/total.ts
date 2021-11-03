import { CommandInteraction } from 'discord.js'
import { ChallengeController, Challenge, ChallengeUser, GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand, RaceTypes } from '../../types'
import { ChallengeService } from '../../services'
import { DateTime, Duration } from 'luxon'

const NAME = 'total'

export const ChallengeTotalCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.total.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'total',
        description: await I18n.translate(locale, 'commands:challenge.total.args.total'),
        type: 'INTEGER',
        required: true
      },
      {
        name: 'type',
        description: await I18n.translate(locale, 'commands:challenge.total.args.type'),
        type: 'STRING',
        choices: Object.values(RaceTypes).map((type) => ({
          name: type,
          value: type
        })),
        required: false
      },
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.total.args.id'),
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
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.noChallengeSpecified'))
      } else {
        await setTotal(activeChallenge, interaction, guildConfig)
      }
    } else {
      // if id is not null, add total to challenge by ID
      const challengeController = await ChallengeController.findOne({ where: { id: interaction.options.getInteger('id') } })
      if (challengeController.errors.length > 0) {
        // fail on not exist
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
      } else {
        await setTotal(challengeController.challenge(), interaction, guildConfig)
      }
    }
  }
}

async function setTotal (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
  } else if (challenge.challenge_type === 'race') { // check whether challenge is race
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeIsRace'))
  } else if (!(challenge.hasStarted)) { // check whether the challenge has started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeHasNotStarted'))
  }

  // we need the war, so get the controller and then the war
  const warController = await ChallengeController.findOne({ where: { id: challenge.id } })
  const war = warController.war
  if ((war.startAt.plus(Duration.fromObject({ minutes: (war.duration + 720) })).diff(DateTime.utc())).milliseconds <= 0) { // check whether war finished more than 12 hours ago
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeTooOld'))
  } else { // all possible error states have been checked, add the total
    // check whether we have a link between war and user, and create it if not
    const challengeUser = await ChallengeUser.findOne({
      where: { userId: interaction.user.id, challengeController: warController.id }
    })
    if (challengeUser == null) {
      const challengeUser = await ChallengeService.addUserToChallenge(interaction.user.id, warController.id, interaction.channel.id)
      if (challengeUser.errors.length > 0) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
        return
      }
    }
    // update total in database
    challengeUser.total = interaction.options.getNumber('total')
    // update total type
    challengeUser.totalType = interaction.options.getString('type') as RaceTypes
    // return success message
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenge:total'))
  }
}
