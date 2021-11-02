import { JobQueue, Logger } from '../../core'
import { Goal } from '../../models'
import { CompleteGoalJobData, WinnieJob } from '../../types'
import { AwardRaptorForGoalJob } from './award-raptors-for-goal-job'

const NAME = 'mark_goal_as_complete_job'

export const CompleteGoalJob: WinnieJob<CompleteGoalJobData> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.goalsQueue.add(NAME, data) },
  execute: async (job) => {
    const goal = await Goal.findOne({ where: { id: job.data.goalId } })
    if (goal == null) { throw new Error('Could not find goal with id') }

    await goal.complete()

    if (goal.errors.length > 0) { throw new Error('Could not mark goal as complete') }

    AwardRaptorForGoalJob.enqueue({ goalId: goal.id }).catch(() => {
      Logger.error(`Unable to enqueue raptors job for goal with id ${goal.id}`)
    })
  }
}
