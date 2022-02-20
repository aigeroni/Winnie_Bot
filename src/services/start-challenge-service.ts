import NanoTimer = require('nanotimer')
import { ChainWar, Challenge, GuildConfig, Race, War } from '../models'
import { ChallengeService } from '.'
import { EndChallengeService } from './end-challenge-service'
import { I18n } from '../core'
import { StatusTypes } from '../types/missions'

export async function handleChallengeOnCreate (challengeId: number, delay: number): Promise<void> {
  const delayString = delay.toString() + 'm'
  const startTimer = new NanoTimer()
  startTimer.setTimeout(() => { startChallenge(challengeId).catch(() => {}) }, [challengeId], delayString)
}

async function startChallenge (challengeId: number): Promise<void> {
  const challenge = (await Challenge.findOne({ where: { id: challengeId }, relations: ['war', 'race', 'chainWar', 'users', 'channels'] }))
  if (challenge == null) { throw new Error(`Could not find challenge with id: ${challengeId}`) }
  if (challenge.status !== StatusTypes.CREATED) { throw new Error(`Challenge with id ${challenge.id} has already been started, it cannot be started again.`) }

  await challenge.start()

  if (challenge.errors.length > 0) {
    throw new Error(`An error occured starting challenge with id: ${challenge.id}`)
  } else {
    switch (challenge.challengeType) {
      case 'race':
        await commenceRace(challengeId, challenge)
        break
      case 'war':
        await commenceWar(challengeId, challenge)
        break
      // case 'chain_war':
      //   await commenceChain(challengeId, challenge)
      //   break
    }
  }
}

async function commenceRace (challengeId: number, challenge: Challenge): Promise<void> {
  const currentRace = challenge as Race
  await sendRaceMessages(challengeId, currentRace)
  await EndChallengeService.handleChallengeOnStart(challengeId, currentRace.duration * 1000 * 60)
}

async function commenceWar (challengeId: number, challenge: Challenge): Promise<void> {
  const currentWar = challenge as War
  await sendWarMessages(challengeId, currentWar)
  await EndChallengeService.handleChallengeOnStart(challengeId, currentWar.duration * 1000 * 60)
}

// async function commenceChain (challengeId: number, challenge: Challenge): Promise<void> {
//   const currentChain = challenge as ChainWar
//   await sendWarMessages(challengeId, currentChain)
//   await EndChallengeService.handleChallengeOnStart(challengeId, currentChain.duration * 1000 * 60)
// }

async function sendRaceMessages (challengeId: number, race: Race): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, async (guildConfig: GuildConfig): Promise<string> => {
    return await I18n.translate(guildConfig.locale, 'challenges:startRace', {
      challengeName: race.name,
      id: challengeId,
      target: race.target,
      type: await I18n.translate(guildConfig.locale, `challenges:types.${race.targetType}`, { count: race.target }),
      timeout: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: race.duration })
    })
  })
}

async function sendWarMessages (challengeId: number, war: War | ChainWar): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, async (guildConfig: GuildConfig): Promise<string> => {
    return await I18n.translate(guildConfig.locale, 'challenges:startWar', {
      challengeName: war.name,
      id: challengeId,
      duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: war.duration })
    })
  })
}

export const StartChallengeService = {
  handleChallengeOnCreate
}
