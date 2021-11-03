import { JobQueue } from '../../core'
import { ChainWar, ChallengeController, Race, War } from '../../models'
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
      if (challenge.challenge_type === 'race') {
        await sendRaceMessages(challengeId, challenge as Race)
      } else if (challenge.challenge_type === 'war') {
        await sendWarMessages(challengeId, challenge as War)
      } else if (challenge.challenge_type === 'chain_war') {
        await sendWarMessages(challengeId, challenge as ChainWar)
      }
    }
  }
}

async function sendRaceMessages (challengeId: number, race: Race): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, 'challenges:startRace', {
    challengeName: race.name,
    id: challengeId,
    target: race.target,
    type: race.targetType,
    timeout: race.timeOut
  })
}

async function sendWarMessages (challengeId: number, war: War | ChainWar): Promise<void> {
  await ChallengeService.sendChallengeMessage(challengeId, 'challenges:startRace', {
    challengeName: war.name,
    id: challengeId,
    duration: war.duration
  })
}
