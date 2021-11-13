import NanoTimer = require('nanotimer')
import { I18n, Logger } from '../core'
import { ChainWar, ChallengeController, GuildConfig, Race, War } from '../models'
import { ChallengeService } from '.'
import { EndChallengeService } from './end-challenge-service'

export async function handleChallengeOnCreate (challengeId: number, delay: number) {
  const delayString = delay.toString() + 'm'
  var startTimer = new NanoTimer()
  startTimer.setTimeout(startChallenge, [challengeId], delayString)
}

async function startChallenge (challengeId: number): Promise<void> {
  const challenge = (await ChallengeController.findOne({ where: { id: challengeId }, relations: ['war', 'race', 'chainWar', 'users', 'channels'] }))?.challenge()
  if (challenge == null) { throw new Error(`Could not find challenge with id: ${challengeId}`) }
  if (challenge.hasStarted) { throw new Error(`Challenge with id ${challenge.id} has already been started, it cannot be started again.`) }

  await challenge.start()

  if (challenge.errors.length > 0) {
    throw new Error(`An error occured starting challenge with id: ${challenge.id}`)
  } else {
    switch (challenge.challenge_type) {
      case 'race':
        const currentRace = challenge as Race
        await sendRaceMessages(challengeId, currentRace)
        await EndChallengeService.handleChallengeOnStart(challengeId, currentRace.timeOut * 1000 * 60)
        break
      case 'war':
        const currentWar = challenge as War
        await sendWarMessages(challengeId, currentWar)
        await EndChallengeService.handleChallengeOnStart(challengeId, currentWar.duration * 1000 * 60)
        break
      case 'chain_war':
        const currentChain = challenge as ChainWar
        await sendWarMessages(challengeId, currentChain)
        await EndChallengeService.handleChallengeOnStart(challengeId, currentChain.duration * 1000 * 60)
        break
    }
  }
}

async function sendRaceMessages (challengeId: number, race: Race): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, async (guildConfig: GuildConfig): Promise<string> => {
    return await I18n.translate(guildConfig.locale, 'challenges:startRace', {
      challengeName: race.name,
      id: challengeId,
      target: race.target,
      type: await I18n.translate(guildConfig.locale, `challenges:types.${race.targetType}`, { count: race.target }),
      timeout: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: race.timeOut })
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

