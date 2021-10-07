import { DateTime } from 'luxon'
import { JobQueue, Logger } from '../../core'
import { GoalService } from '../../services'
import { EnqueueGoalsToCompleteJobData, WinnieJob } from '../../types'
import { CompleteGoalJob } from './complete-goal-job'

/**
 * 15 minutes as milliseconds.
 *
 * If a goal if within 15 of being completed we want
 * to enqueue it for completion
 */
const GOAL_COMPLETION_MARGIN = 900000

const NAME = 'enqueue_goals_to_complete_job'

export const EnqueueGoalsToCompleteJob: WinnieJob<EnqueueGoalsToCompleteJobData> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.goalsQueue.add(NAME, data) },
  execute: async (job) => {
    const goals = await GoalService.allActive()

    const goalsToComplete = goals.filter((goal) => {
      const enqueueAt = DateTime.fromISO(job.data.time)

      const timeLeft = goal.endDate().diff(enqueueAt)
      return timeLeft.milliseconds < GOAL_COMPLETION_MARGIN
    })

    goalsToComplete.forEach((goal) => {
      CompleteGoalJob.enqueue({ goalId: goal.id }).catch(() => {
        Logger.error(`Unable to enqueue completion job for goal with id ${goal.id}`)
      })
    })
  }
}
