import { CompleteGoalJob } from './complete-goal-job'
import { EnqueueGoalsToCompleteJob } from './enqueue-goals-to-complete-job'

const all = [
  CompleteGoalJob,
  EnqueueGoalsToCompleteJob
]

export const goalJobs = {
  all,
  CompleteGoalJob,
  EnqueueGoalsToCompleteJob
}
