import { CommandInteraction } from 'discord.js'
import { ChallengeController, Challenge, ChallengeUser, GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand } from '../../types'
import { ChallengeService } from '../../services'
import { DateTime, Duration } from 'luxon'

const NAME = 'finish'

export const ChallengeFinishCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.cancel.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.cancel.id.description'),
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
        await completeRace(activeChallenge, interaction, guildConfig)
      }
    } else {
      // if id is not null, add total to challenge by ID
      const challengeController = await ChallengeController.findOne({ where: { id: interaction.options.getInteger('id') } })
      if (challengeController !== undefined) {
        await completeRace(challengeController.challenge(), interaction, guildConfig)
      } else {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
      }
    }
  }
}

async function completeRace (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
    return
  } else if (challenge.challenge_type !== 'race') { // check whether challenge is race
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeIsRace'))
    return
  } else if (!(challenge.hasStarted)) { // check whether the challenge has started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeHasNotStarted'))
    return
  }

  // we need the race, so get the controller and then the race
  const raceController = await ChallengeController.findOne({ where: { id: challenge.id } })
  const race = raceController.race
  if ((race.startAt.plus(Duration.fromObject({ minutes: (race.timeOut + 720) })).diff(DateTime.utc())).milliseconds <= 0) { // check whether race finished more than 12 hours ago
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeTooOld'))
  } else { // all possible error states have been checked, add the total
    // check whether we have a link between race and user, and create it if not
    const challengeUser = await ChallengeUser.findOne({
      where: { userId: interaction.user.id, challengeController: raceController.id }
    })
    if (challengeUser == null) {
      const challengeUser = await ChallengeService.addUserToChallenge(interaction.user.id, raceController.id, interaction.channel.id)
      if (challengeUser.errors.length > 0) {
        await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.couldNotFinishChallenge'))
        return
      }
    }
    // update total in database
    challengeUser.total = race.target
    // update total type
    challengeUser.totalType = race.targetType
    // update timestamp
    challengeUser.finishedAt = DateTime.utc()
    // return success message
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.success'))
  }
}
