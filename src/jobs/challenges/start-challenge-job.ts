import { I18n, JobQueue } from '../../core'
import { ChainWar, ChallengeController, GuildConfig, Race, War } from '../../models'
import { ChallengeService } from '../../services'
import { StartChallengeJobData, WinnieJob } from '../../types'

const NAME = 'start_challenge_job'

export const StartChallengeJob: WinnieJob<StartChallengeJobData> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.challengesQueue.add(NAME, data) },
  execute: async (job) => {
    const challengeId = job.data.challengeId
    const challenge = (await ChallengeController.findOne({ where: { id: challengeId } }))?.challenge()
    if (challenge == null) { throw new Error(`Could not find challenge with id: ${job.data.challengeId}`) }
    if (challenge.hasStarted) { throw new Error(`Challenge with id ${challenge.id} has already been started, it cannot be started again.`) }

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
