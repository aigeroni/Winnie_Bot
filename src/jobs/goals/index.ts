import { CompleteGoalJob } from './complete-goal-job'
import { EnququeGoalsToCompleteJob } from './enqueue-goals-to-complete-job'

const all = [
  CompleteGoalJob,
  EnququeGoalsToCompleteJob
]

export const goalJobs = {
  all,
  CompleteGoalJob,
  EnququeGoalsToCompleteJob
}
