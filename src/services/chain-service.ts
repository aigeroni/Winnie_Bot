import { DateTime, Duration } from 'luxon'
import { ChainWar, ChallengeController, ChallengeChannel, ChallengeUser } from '../models'
import { ChainCreateOptions } from '../types'
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
  if (options.join != null) {
    const user = new ChallengeUser()
    user.challengeController = controller.id
    user.userId = options.ownerId
  }

  return await chain.save()
}

function getStartTime (delay): DateTime {
  const createTime = DateTime.local()
  const difference = Duration(delay.minutes)
  return createTime.plus(difference)
}

export const ChainService = {
  createChain
}
