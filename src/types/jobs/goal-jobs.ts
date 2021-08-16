import { DateTime } from 'luxon'

export interface CompleteGoalJobData {
  goalId: number
}

export interface EnququeGoalsToCompleteJobData {
  time: DateTime
}
