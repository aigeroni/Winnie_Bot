import { JobQueue } from '../../core'
import { ChallengeController } from '../../models'
import { ChallengeService } from '../../services'
import { StartChallengeJobData, WinnieJob } from '../../types'

const NAME = 'start_challenge_job'

export const StartChallengeJob: WinnieJob<StartChallengeJobData> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.challengesQueue.add(NAME, data) },
  execute: async (job) => {
    const challenge = (await ChallengeController.findOne({ where: { id: job.data.challengeId } }))?.challenge()
    if (challenge == null) { throw new Error(`Could not find challenge with id: ${job.data.challengeId}`) }
    if (challenge.hasStarted) { throw new Error(`Challenge with id ${challenge.id} has already been started, it cannot be started again.`) }

    await challenge.start()

    if (challenge.errors.length > 0) {
      throw new Error(`An error occured starting challenge with id: ${challenge.id}`)
    } else {
      await ChallengeService.sendChallengeMessage(challenge.id, 'challenges:started')
    }
  }
}
