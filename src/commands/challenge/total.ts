import { Challenge, ChallengeTotal, GuildConfig, War } from '../../models'
import { ChallengeService } from '../../services'
import { CommandInteraction } from 'discord.js'
import { I18n } from '../../core'
import { RaceTypes, SubCommand } from '../../types'
import { StatusTypes } from '../../types/missions'

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

    const challengeTotal = await getchallengeTotal(challenge as War, interaction, guildConfig)
    if (challengeTotal == null) { return }

    await updateTotals(challengeTotal, interaction, guildConfig)
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

  if (challenge.challengeType !== 'war') { // ensure the challenge is a war
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.challengeIsRace'))
    return false
  }

  if (!(challenge.status !== StatusTypes.COMPLETED)) { // check whether the challenge has started
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
 * Returns the challengeTotal for the given user and challenge.
 *
 * If there is not a challengeTotal record yet, create one first.
 *
 * @param war The war which we are gettign the user for
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 * @returns The challengeTotal object, undefined if an error occured
 */
async function getchallengeTotal (war: War, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<ChallengeTotal | undefined> {
  const challengeTotal = await ChallengeTotal.findOne({ where: { userId: interaction.user.id, challengeController: war.id } })
  if (challengeTotal != null) { return challengeTotal }

  const newChallengeTotal = await ChallengeService.addUserToChallenge(interaction.user.id, war.id, interaction.channelId)
  if (newChallengeTotal.errors.length <= 0) { return challengeTotal }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
}

/**
 * Attempts to update the Challenge totals.
 *
 * @param challengeTotal The ChallengeTotal updating their totals
 * @param interaction the interaction used to trigger the command
 * @param guildConfig the config of the guild where the command was used
 */
async function updateTotals (challengeTotal: ChallengeTotal, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const total = interaction.options.getNumber('total')
  const type = interaction.options.getString('type')

  if (total == null || type == null) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
    return
  }

  challengeTotal.total = total
  challengeTotal.totalType = type as RaceTypes

  await challengeTotal.save()
  if (challengeTotal.errors.length <= 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenge:total'))
    return
  }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.total.error.couldNotAddTotal'))
}
