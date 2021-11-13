import NanoTimer = require('nanotimer')
import { I18n, Logger } from '../core'
import { ChainWar, ChallengeController, GuildConfig, Race, War } from '../models'
import { ChallengeService } from '.'

export async function handleChallengeOnStart (challengeId: number, duration: number) {
  const durationString = duration.toString() + 'm'
  var endTimer = new NanoTimer()
  endTimer.setTimeout(endChallenge, [challengeId], durationString)
}

async function endChallenge (challengeId: number): Promise<void> {
  const challenge = (await ChallengeController.findOne({ where: { id: challengeId }, relations: ['war', 'race', 'chainWar', 'users', 'channels'] }))?.challenge()
  if (challenge == null) { throw new Error(`Could not find challenge with id: ${challengeId}`) }
  if (challenge.isCompleted() || challenge.isCanceled()) { throw new Error(`Challenge with id ${challenge.id} has already been ended, it cannot be ended again.`) }

  await challenge.complete()

  if (challenge.errors.length > 0) {
    throw new Error(`An error occured ending challenge with id: ${challenge.id}`)
  } else {
    switch (challenge.challenge_type) {
      case 'race':
        await sendRaceMessages(challengeId, challenge as Race)
        break
      case 'war':
        await sendWarMessages(challengeId, challenge as War)
        break
      case 'chain_war':
        await sendWarMessages(challengeId, challenge as ChainWar)
        break
    }
  }
}

async function sendRaceMessages (challengeId: number, race: Race): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, async (guildConfig: GuildConfig): Promise<string> => {
    return await I18n.translate(guildConfig.locale, 'challenges:completeRace', {
      challengeName: race.name,
      id: challengeId,
      target: race.target,
      type: await I18n.translate(guildConfig.locale, `challenges:types.${race.targetType}`, { count: race.target })
    })
  })
}

async function sendWarMessages (challengeId: number, war: War | ChainWar): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, async (guildConfig: GuildConfig): Promise<string> => {
    return await I18n.translate(guildConfig.locale, 'challenges:completeWar', {
      challengeName: war.name,
      id: challengeId,
    })
  })
}

export const EndChallengeService = {
  handleChallengeOnStart
}

