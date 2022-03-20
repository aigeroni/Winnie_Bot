import {
  ChainWar,
  Challenge,
  ChallengeTotal,
  GuildConfig,
  Race,
  War
} from '../models'
import { ChainWarCreateOptions, RaceCreateOptions, TargetTypes, WarCreateOptions } from '../types'
import { CommandInteraction, Snowflake } from 'discord.js'
import { DateTime, Duration } from 'luxon'
// import { DiscordService } from '.'
import { I18n, Logger } from '../core'

/**
  * Creates a new chain war from the arguments passed to the command.
  *
  * @param options The details to use when creating the chain war
  * @returns the new chain war
  */
async function createChainWar (options: ChainWarCreateOptions): Promise<ChainWar> {
  const chain = new ChainWar()
  chain.numberOfWars = options.chainLength

  if (options.duration != null) { chain.duration = options.duration }
  if (options.ownerId != null) { chain.ownerId = options.ownerId }
  if (options.name != null) { chain.name = options.name }
  if (options.split != null) { chain.warMargin = options.split }

  chain.startAt = getStartTime(options.delay)
  await chain.save()

  Logger.info(options.join)

  // if (options.channelId != null) {
  //   await addChannelToChallenge(options.channelId, chain.id)
  // }
  if (options.join && options.ownerId != null && options.channelId != null) {
    await addUserToChallenge(options.ownerId, chain.id, options.channelId)
  }

  return await chain.save()
}

/**
  * Creates a new race from the arguments passed to the command.
  *
  * @param options The details to use when creating the race
  * @returns the new race
  */
async function createRace (options: RaceCreateOptions): Promise<Race> {
  const race = new Race()
  race.target = options.target

  if (options.duration != null) { race.duration = options.duration }
  if (options.ownerId != null) { race.ownerId = options.ownerId }
  if (options.name != null) { race.name = options.name }
  if (options.type != null) { race.targetType = options.type }

  race.startAt = getStartTime(options.delay)
  await race.save()

  // if (options.channelId != null) {
  //   await addChannelToChallenge(options.channelId, race.id)
  // }
  if (options.join && options.ownerId != null && options.channelId != null) {
    await addUserToChallenge(options.ownerId, race.id, options.channelId)
  }

  return await race.save()
}

/**
  * Creates a new war from the arguments passed to the command.
  *
  * @param options The details to use when creating the war
  * @returns the new war
  */
async function createWar (options: WarCreateOptions): Promise<War> {
  const war = new War()
  if (options.duration != null) { war.duration = options.duration }
  if (options.ownerId != null) { war.ownerId = options.ownerId }
  if (options.name != null) { war.name = options.name }

  war.startAt = getStartTime(options.delay)
  await war.save()

  // if (options.channelId != null) {
  //   await addChannelToChallenge(options.channelId, war.id)
  // }
  if (options.join && options.ownerId != null && options.channelId != null) {
    await addUserToChallenge(options.ownerId, war.id, options.channelId)
  }

  return await war.save()
}

/**
  * Creates a database link between a user and a challenge.
  *
  * @param userId The ID of the user to link
  * @param challengeId The ID of the challenge to link
  * @returns a challenge/user link
  */
async function addUserToChallenge (userId: Snowflake, challengeId: number, channelId: Snowflake): Promise<ChallengeTotal> {
  const challengeTotal = new ChallengeTotal()
  challengeTotal.challenge = challengeId
  challengeTotal.userId = userId
  challengeTotal.channelId = channelId
  challengeTotal.totalType = 'words' as TargetTypes

  return await challengeTotal.save()
}

/**
  * Adds a channel to the list of channels that a challenge should post to.
  *
  * @param channelId The ID of the channel to link
  * @param challengeId The ID of the challenge to link in the controller table
  * @returns a challenge/channel link
  */
async function addChannelToChallenge (channelId: Snowflake, challenge: Challenge): Promise<Challenge> {
  challenge.update(groupId, { users: [...group.users, { id: userId }] })

  return await challenge.save()
}

/**
  * Gets the active challenge for the given user
  *
  * @param userId The discord ID of the user to find the goal for
  * @returns The user's active challenge, null if the don't have one
  */
async function activeChallengeForUser (userId: Snowflake): Promise<Challenge | undefined> {
  const userJoinedTotals = await ChallengeTotal.find({ where: { userId: userId, completedAt: null, canceledAt: null } })

  const activeChallenges = userJoinedTotals.map(async total => (
    await Challenge.findOne({ where: { challengeId: total.challenge, completedAt: null, canceledAt: null } })
  ))

  if (activeChallenges.length === 0) {
    return
  }

  return activeChallenges[0]
}
/**
 * Sends a message to all the channels which are joined to a given challenge.
 *
 * @param challengeId the universal id of the challenge
 * @param messageKey the localisation key of the message to send
 */
async function sendChallengeMessage (challengeId: number, getMessage: (guildConfig: GuildConfig) => Promise<string>): Promise<void> {
  const challenge = await Challenge.findOne({ where: { id: challengeId }, relations: ['war', 'race', 'chainWar', 'users', 'channels'] })
  if (challenge == null) {
    Logger.error(`Unable to send messages for challenge with id: ${challengeId}. The challenge could not be found.`)
    // return
  }

  // challenge.channels.forEach((channel) => {
  //   DiscordService.sendMessageToChannel(channel.channelId, getMessage).catch(() => {})
  // })
}

async function getChallengeFromCommand (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<Challenge | undefined> {
  const challengeId = interaction.options.getInteger('id')
  Logger.info(challengeId)
  let challenge: Challenge | undefined

  if (challengeId == null) {
    challenge = await ChallengeService.activeChallengeForUser(interaction.user.id)

    if (challenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.error.noChallengeSpecified'))
    }
  } else {
    Logger.info('entered else block')
    challenge = (await Challenge.findOne({ where: { id: challengeId }, relations: ['war', 'race', 'chainWar', 'users', 'channels'] }))
    Logger.info(JSON.stringify(challenge))
  }

  if (challenge == null) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.error.challengeDoesNotExist'))
    return
  }

  return challenge
}

function getStartTime (delay: number): DateTime {
  const createTime = DateTime.local()
  const difference = Duration.fromObject({ milliseconds: delay })
  return createTime.plus(difference)
}

export const ChallengeService = {
  activeChallengeForUser,
  addChannelToChallenge,
  addUserToChallenge,
  createChainWar,
  createRace,
  createWar,
  getChallengeFromCommand,
  sendChallengeMessage
}
