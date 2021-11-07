import NanoTimer from 'nanotimer'
import { I18n, Logger } from '../../core'
import { ChainWar, ChallengeController, GuildConfig, Race, War } from '../../models'
import { ChallengeService } from '../../services'

export async function CreateChallenge (challengeId: number, delay: number) {
  console.log(delay)
  const delayString = delay.toString() + 'm'
  var timer = new NanoTimer();
  timer.setTimeout(StartChallenge, [challengeId], delayString);
}

async function StartChallenge (challengeId: number): Promise<void> {
  Logger.info('entered challenge start')
  Logger.info(JSON.stringify(await ChallengeController.findOne({ where: { id: challengeId } })))
  const challenge = (await ChallengeController.findOne({ where: { id: challengeId } }))?.challenge()
  if (challenge == null) { throw new Error(`Could not find challenge with id: ${challengeId}`) }
  if (challenge.hasStarted) { throw new Error(`Challenge with id ${challenge.id} has already been started, it cannot be started again.`) }
  Logger.info('bypassed errors')

  await challenge.start()

  if (challenge.errors.length > 0) {
    throw new Error(`An error occured starting challenge with id: ${challenge.id}`)
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
    return await I18n.translate(guildConfig.locale, 'challenges:startRace', {
      challengeName: race.name,
      id: challengeId,
      target: race.target,
      type: await I18n.translate(guildConfig.locale, `challenges:types.${race.targetType}`, { count: race.target }),
      timeout: await I18n.translate(guildConfig.locale, 'challenges:purals.minutes', { count: race.timeOut })
    })
  })
}

async function sendWarMessages (challengeId: number, war: War | ChainWar): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, async (guildConfig: GuildConfig): Promise<string> => {
    return await I18n.translate(guildConfig.locale, 'challenges:startRace', {
      challengeName: war.name,
      id: challengeId,
      duration: await I18n.translate(guildConfig.locale, 'challenges:purals.minutes', { count: war.duration })
    })
  })
}
