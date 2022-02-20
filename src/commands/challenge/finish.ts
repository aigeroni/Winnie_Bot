import { Challenge, ChallengeTotal, GuildConfig, Race } from '../../models'
import { ChallengeService } from '../../services'
import { CommandInteraction } from 'discord.js'
import { DateTime, Duration } from 'luxon'
import { I18n } from '../../core'
import { StatusTypes } from '../../types/missions'
import { SubCommand } from '../../types'

const NAME = 'finish'

export const ChallengeFinishCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.finish.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.finish.args.id'),
        type: 'INTEGER',
        required: false
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const challenge = await ChallengeService.getChallengeFromCommand(interaction, guildConfig)
    if (challenge == null) { return }

    if (!(await canFinishRace(challenge, interaction, guildConfig))) { return }

    const challengeTotal = await getChallengeTotal(challenge as Race, interaction, guildConfig)
    if (challengeTotal == null) { return }

    await finishRace(challengeTotal, challenge as Race, interaction, guildConfig)
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

  if (challenge.challengeType !== 'race') { // check whether challenge is race
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeIsNotRace'))
    return false
  }

  if (challenge.status === StatusTypes.CREATED) { // check whether the challenge has started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeHasNotStarted'))
    return false
  }

  const race = challenge as Race
  if ((race.startAt.plus(Duration.fromObject({ minutes: (race.duration + 60) })).diff(DateTime.utc())).milliseconds <= 0) { // check whether race finished more than 12 hours ago
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.challengeTooOld'))
  }

  return true
}

/**
 * Returns the ChallengeTotal for the given user and challenge.
 *
 * If there is not a ChallengeTotal record yet, create one first.
 *
 * @param war The war which we are gettign the user for
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 * @returns The ChallengeTotal object, undefined if an error occured
 */
async function getChallengeTotal (race: Race, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<ChallengeTotal | undefined> {
  let challengeTotal = await ChallengeTotal.findOne({ where: { userId: interaction.user.id, challenge: race.id } })
  if (challengeTotal != null) { return challengeTotal }

  challengeTotal = await ChallengeService.addUserToChallenge(interaction.user.id, race.id, interaction.channelId)
  if (challengeTotal.errors.length <= 0) { return challengeTotal }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.couldNotFinishChallenge'))
}

/**
 * Attempts to finish the challenge
 *
 * @param challengeTotal The ChallengeTotal updating their totals
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 */
async function finishRace (challengeTotal: ChallengeTotal, race: Race, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  challengeTotal.total = race.target
  challengeTotal.totalType = race.targetType
  challengeTotal.completedAt = DateTime.utc()

  await challengeTotal.save()
  if (challengeTotal.errors.length <= 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.success'))
    return
  }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.finish.error.couldNotFinishChallenge'))
}
