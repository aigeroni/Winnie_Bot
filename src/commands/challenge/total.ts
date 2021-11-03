import { CommandInteraction } from 'discord.js'
import { Challenge, ChallengeUser, GuildConfig, War } from '../../models'
import { I18n } from '../../core'
import { SubCommand, RaceTypes } from '../../types'
import { ChallengeService } from '../../services'

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
    const challenge = await ChallengeService.getChallengeFromCommand(interaction, guildConfig)
    if (challenge == null) { return }

    if (!(await canUpdateTotals(challenge, interaction, guildConfig))) { return }

    const challengeUser = await getChallengeUser(challenge as War, interaction, guildConfig)
    if (challengeUser == null) { return }

    await updateTotals(challengeUser, interaction, guildConfig)
  }
}

/**
 * Checks several conditions to ensure the challenge can be updated.
 *
 * @param challenge The challenge which the user participated in.
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 * @returns True if the total can be updated
 */
async function canUpdateTotals (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<boolean> {
  if (challenge.isCanceled()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeDoesNotExist'))
    return false
  }

  if (challenge.challenge_type !== 'war') { // ensure the challenge is a war
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeIsRace'))
    return false
  }

  if (!(challenge.hasStarted)) { // check whether the challenge has started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeHasNotStarted'))
    return false
  }

  const war = challenge as War

  if (war.olderThanTwelveHours()) { // check whether war finished more than 12 hours ago
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeTooOld'))
    return false
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
async function getChallengeUser (war: War, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<ChallengeUser | undefined> {
  let challengeUser = await ChallengeUser.findOne({ where: { userId: interaction.user.id, challengeController: war.universalId.id } })
  if (challengeUser != null) { return challengeUser }

  challengeUser = await ChallengeService.addUserToChallenge(interaction.user.id, war.universalId.id, interaction.channelId)
  if (challengeUser.errors.length <= 0) { return challengeUser }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
}

/**
 * Attempts to update the Challenge totals.
 *
 * @param challengeUser The ChallengeUser updating their totals
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 */
async function updateTotals (challengeUser: ChallengeUser, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const total = interaction.options.getNumber('total')
  const type = interaction.options.getString('type')

  if (total == null || type == null) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
    return
  }

  challengeUser.total = total
  challengeUser.totalType = type as RaceTypes

  await challengeUser.save()
  if (challengeUser.errors.length <= 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenge:total'))
    return
  }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
}
