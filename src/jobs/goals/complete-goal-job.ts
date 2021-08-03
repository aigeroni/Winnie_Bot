import { DateTime } from 'luxon'
import { JobQueue } from '../../core'
import { Goal } from '../../models'
import { CompleteGoalJobData, WinnieJob } from '../../types'

const NAME = 'mark_goal_as_complete_job'

export const CompleteGoalJob: WinnieJob<CompleteGoalJobData> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.goalsQueue.add(NAME, data) },
  execute: async (job) => {
    const goal = await Goal.findOne({ where: { id: job.data.goalId } })
    if (goal == null) { throw new Error('Could not find goal with id') }

    goal.completedAt = DateTime.local()
    await goal.save()

    if (goal.errors.length > 0) { throw new Error('Could not mark goal as complete') }

    // TODO: Enqueue AwardRaptorsJob
  }
}
