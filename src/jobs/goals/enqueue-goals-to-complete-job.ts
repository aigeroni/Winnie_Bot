import { CompleteGoalJob } from './complete-goal-job'
import { DateTime } from 'luxon'
import { GoalService } from '../../services'
import { JobQueue, Logger } from '../../core'
import { WinnieJob } from '../../types'

const NAME = 'enqueue_goals_to_complete_job'

export const EnqueueGoalsToCompleteJob: WinnieJob<void> = {
  name: NAME,
  enqueue: async (data) => { await JobQueue.queues.goalsQueue.add(NAME, data) },
  execute: async () => {
    const goals = await GoalService.allActive()

    const goalsToComplete = goals.filter((goal) => {
      const timeLeft = goal.endDate().diff(DateTime.utc())

      return timeLeft.milliseconds < 0
    })

    goalsToComplete.forEach((goal) => {
      CompleteGoalJob.enqueue({ goalId: goal.id }).catch(() => {
        Logger.error(`Unable to enqueue completion job for goal with id ${goal.id}`)
      })
    })
  }
}
