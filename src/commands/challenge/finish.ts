import { CommandInteraction } from 'discord.js'
import { Challenge, ChallengeUser, GuildConfig, Race } from '../../models'
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
    const challenge = await ChallengeService.getChallengeFromCommand(interaction, guildConfig)
    if (challenge == null) { return }

    if (!(await canFinishRace(challenge, interaction, guildConfig))) { return }

    const challengeUser = await getChallengeUser(challenge as Race, interaction, guildConfig)
    if (challengeUser == null) { return }

    await finishRace(challengeUser, challenge as Race, interaction, guildConfig)
  }
}

/**
 * Checks several conditions to ensure the challenge can be updated.
 *
 * @param challenge The challenge which the user participated in.
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 * @returns True if the race can be finished
 */
async function canFinishRace (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<boolean> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeDoesNotExist'))
    return false
  }

  if (challenge.challenge_type !== 'race') { // check whether challenge is race
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeIsRace'))
    return false
  }

  if (!(challenge.hasStarted)) { // check whether the challenge has started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeHasNotStarted'))
    return false
  }

  const race = challenge as Race
  if ((race.startAt.plus(Duration.fromObject({ minutes: (race.timeOut + 720) })).diff(DateTime.utc())).milliseconds <= 0) { // check whether race finished more than 12 hours ago
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeTooOld'))
  }

  return true
}

/**
 * Returns the ChallengeUser for the given user and challenge.
 *
 * If there is not a ChallengeUser record yet, create one first.
 *
 * @param war The war which we are gettign the user for
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 * @returns The ChallengeUser object, undefined if an error occured
 */
async function getChallengeUser (race: Race, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<ChallengeUser | undefined> {
  let challengeUser = await ChallengeUser.findOne({ where: { userId: interaction.user.id, challengeController: race.universalId.id } })
  if (challengeUser != null) { return challengeUser }

  challengeUser = await ChallengeService.addUserToChallenge(interaction.user.id, race.universalId.id, interaction.channelId)
  if (challengeUser.errors.length <= 0) { return challengeUser }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.couldNotFinishChallenge'))
}

/**
 * Attempts to finish the challenge
 *
 * @param challengeUser The ChallengeUser updating their totals
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 */
async function finishRace (challengeUser: ChallengeUser, race: Race, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  challengeUser.total = race.target
  challengeUser.totalType = race.targetType
  challengeUser.finishedAt = DateTime.utc()

  await challengeUser.save()
  if (challengeUser.errors.length <= 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.success'))
    return
  }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
}
