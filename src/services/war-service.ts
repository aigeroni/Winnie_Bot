import { DateTime, Duration } from 'luxon'
import { War, ChallengeController, ChallengeChannel, ChallengeUser } from '../models'
import { WarCreateOptions } from '../types'
import { Snowflake } from 'discord.js'

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
  if (options.join != null) {
    const user = new ChallengeUser()
    user.challengeController = controller.id
    user.userId = options.ownerId
  }

  return await war.save()
}

function getStartTime (delay): DateTime {
  const createTime = DateTime.local()
  const difference = Duration(delay.minutes)
  return createTime.plus(difference)
}

export const WarService = {
  createWar
}
