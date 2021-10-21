import { JobQueue } from '../../core'
import { Goal } from '../../models'
import { RaptorService } from '../../services'
import { AwardRaptorForGoalJobData, WinnieJob } from '../../types'

const NAME = 'award_raptors_for_goal_job'

export const AwardRaptorForGoalJob: WinnieJob<AwardRaptorForGoalJobData> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.goalsQueue.add(NAME, data) },
  execute: async (job) => {
    const goal = await Goal.findOne({ where: { id: job.data.goalId } })
    if (goal == null) { throw new Error('Could not find goal with id') }
    if (!goal.isCompleted()) { throw new Error('Could not award raptors for incomplete goal') }

    await RaptorService.awardRaptorForGoal(goal)
  }
}
