import { AwardRaptorForGoalJob } from './award-raptors-for-goal-job'
import { CompleteGoalJob } from './complete-goal-job'
import { EnqueueGoalsToCompleteJob } from './enqueue-goals-to-complete-job'

const all = [
  AwardRaptorForGoalJob,
  CompleteGoalJob,
  EnqueueGoalsToCompleteJob
]

export const goalJobs = {
  all,
  AwardRaptorForGoalJob,
  CompleteGoalJob,
  EnqueueGoalsToCompleteJob
}
