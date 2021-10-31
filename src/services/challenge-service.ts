import { DateTime, Duration } from 'luxon'
import { ChainWar, Race, War, ChallengeController, ChallengeChannel, ChallengeUser } from '../models'
import { ChainCreateOptions, RaceCreateOptions, WarCreateOptions } from '../types'
import { Snowflake } from 'discord.js'

/**
  * Creates a new chain war from the arguments passed to the command.
  *
  * @param options The details to use when creating the chain war
  * @returns the new chain war
  */
 async function createChain (options: ChainCreateOptions): Promise<ChainWar> {
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
    const channel = new ChallengeChannel()
    channel.challengeController = controller.id
    channel.channelId = options.channelId
  }
  if (options.join != null && options.ownerId != null) {
    const user = new ChallengeUser()
    user.challengeController = controller.id
    user.userId = options.ownerId
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
  if (options.type != null) { race.targetType =options.type }

  race.startAt = getStartTime(options.delay)

  const controller = new ChallengeController()
  controller.race = race

  if (options.channelId != null) {
    const channel = new ChallengeChannel()
    channel.challengeController = controller.id
    channel.channelId = options.channelId
  }
  if (options.join != null && options.ownerId != null) {
    const user = new ChallengeUser()
    user.challengeController = controller.id
    user.userId = options.ownerId
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
    const channel = new ChallengeChannel()
    channel.challengeController = controller.id
    channel.channelId = options.channelId
  }
  if (options.join != null && options.ownerId != null) {
    const user = new ChallengeUser()
    user.challengeController = controller.id
    user.userId = options.ownerId
  }

  return await war.save()
}

/**
  * Gets a challenge with a given ID.
  *
  * @param id The ID in the challenge controller table of the challenge to get
  * @returns the challenge with that ID
  */
 async function getChallengeById (id: number): Promise<ChallengeController | null> {

  const challenge = await ChallengeController.find({
    where: { id: id }
  })

  if (challenge.length === 0) {
    return null
  } else {
    return challenge[0]
  }
}

// /**
//   * Checks whether the given user has joined a war.
//   *
//   * @param userId The discord ID of the user to find the goal for
//   */
// async function userHasJoinedChallenge (userId: Snowflake): Promise<ChallengeController | null> {

//   const userJoinedChallenges = await ChallengeController.find({
//     where: {
//       ChallengeUser: { ownerId: userId }
//     },
//     relations: [ "ChallengeUser" ]
//   })

//   const activeRaces = await Race.find(

//   )

//   const activeChallenges = userJoinedChallenges.filter((challengeController) => challengeController.isActive())

//   if (activeChallenges.length === 0) {
//     return null
//   } else {
//     return activeChallenges[0]
//   }
// }

function getStartTime (delay: number): DateTime {
  const createTime = DateTime.local()
  const difference = Duration.fromObject({minutes: delay})
  return createTime.plus(difference)
}

export const ChallengeService = {
  createChain,
  createRace,
  createWar
}
