import { DateTime, Duration } from 'luxon'
import { Race, ChallengeController, ChallengeChannel, ChallengeUser } from '../models'
import { RaceCreateOptions, RaceTypes} from '../types'
import { Snowflake } from 'discord.js'

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
  if (options.join != null) {
    const user = new ChallengeUser()
    user.challengeController = controller.id
    user.userId = options.ownerId
  }

  return await race.save()
}

function getStartTime (delay): DateTime {
  const createTime = DateTime.local()
  const difference = Duration(delay.minutes)
  return createTime.plus(difference)
}
export const RaceService = {
  createRace
}
