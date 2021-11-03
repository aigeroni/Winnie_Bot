import { DateTime, Duration } from 'luxon'
import {
  ChainWar,
  Race,
  War,
  Challenge,
  ChallengeController,
  ChallengeChannel,
  ChallengeUser,
  GuildConfig
} from '../models'
import { ChainWarCreateOptions, RaceCreateOptions, WarCreateOptions } from '../types'
import { Snowflake } from 'discord.js'
import { Logger } from '../core'
import { DiscordService } from '.'

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
  if (options.ownerId != null) { chain.createdBy = options.ownerId }
  if (options.name != null) { chain.name = options.name }
  if (options.split != null) { chain.warMargin = options.split }

  chain.startAt = getStartTime(options.delay)

  const controller = new ChallengeController()
  controller.chainWar = chain

  if (options.channelId != null) {
    await addChannelToChallenge(options.channelId, controller.id)
  }
  if (options.join != null && options.ownerId != null && options.channelId != null) {
    await addUserToChallenge(options.ownerId, controller.id, options.channelId)
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

  if (options.duration != null) { race.timeOut = options.duration }
  if (options.ownerId != null) { race.createdBy = options.ownerId }
  if (options.name != null) { race.name = options.name }
  if (options.type != null) { race.targetType = options.type }

  race.startAt = getStartTime(options.delay)

  const controller = new ChallengeController()
  controller.race = race

  if (options.channelId != null) {
    await addChannelToChallenge(options.channelId, controller.id)
  }
  if (options.join != null && options.ownerId != null && options.channelId != null) {
    await addUserToChallenge(options.ownerId, controller.id, options.channelId)
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
  if (options.ownerId != null) { war.createdBy = options.ownerId }
  if (options.name != null) { war.name = options.name }

  war.startAt = getStartTime(options.delay)

  const controller = new ChallengeController()
  controller.war = war

  if (options.channelId != null) {
    await addChannelToChallenge(options.channelId, controller.id)
  }
  if (options.join != null && options.ownerId != null && options.channelId != null) {
    await addUserToChallenge(options.ownerId, controller.id, options.channelId)
  }

  return await war.save()
}

/**
  * Creates a database link between a user and a challenge.
  *
  * @param userId The ID of the user to link
  * @param controllerId The ID of the challenge to link in the controller table
  * @returns a challenge/user link
  */
async function addUserToChallenge (userId: Snowflake, controllerId: number, channelId: Snowflake): Promise<ChallengeUser> {
  const challengeUser = new ChallengeUser()
  challengeUser.challengeController = controllerId
  challengeUser.userId = userId
  challengeUser.channelId = channelId

  return await challengeUser.save()
}

/**
  * Creates a database link between a channel and a challenge.
  *
  * @param channelId The ID of the channel to link
  * @param controllerId The ID of the challenge to link in the controller table
  * @returns a challenge/channel link
  */
async function addChannelToChallenge (channelId: Snowflake, controllerId: number): Promise<ChallengeChannel> {
  const challengeChannel = new ChallengeChannel()
  challengeChannel.challengeController = controllerId
  challengeChannel.channelId = channelId

  return await challengeChannel.save()
}

/**
  * Gets the active challenge for the given user
  *
  * @param userId The discord ID of the user to find the goal for
  * @returns The user's active challenge, null if the don't have one
  */
async function activeChallengeForUser (userId: Snowflake): Promise<Challenge | undefined> {
  const userJoinedChallenges = await ChallengeController.find({
    where: { ChallengeUser: { ownerId: userId } },
    relations: ['ChallengeUser']
  })

  const activeChallenges: Challenge[] = userJoinedChallenges.reduce(
    (active: Challenge[], controller: ChallengeController): Challenge[] => {
      const challenge = controller.challenge()
      if (challenge == null) { return active }
      if (!challenge.isActive()) { return active }

      return [...active, challenge]
    }, []
  )

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
  const challengeController = await ChallengeController.findOne({ where: { id: challengeId } })
  if (challengeController == null) {
    Logger.error(`Unable to send messages for challenge with id: ${challengeId}. The challenge could not be found.`)
    return
  }

  challengeController.channels.forEach((channel) => {
    DiscordService.sendMessageToChannel(channel.channelId, getMessage).catch(() => {})
  })
}

function getStartTime (delay: number): DateTime {
  const createTime = DateTime.local()
  const difference = Duration.fromObject({ minutes: delay })
  return createTime.plus(difference)
}

export const ChallengeService = {
  activeChallengeForUser,
  addChannelToChallenge,
  addUserToChallenge,
  createChainWar,
  createRace,
  createWar,
  sendChallengeMessage
}
