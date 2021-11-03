import { DateTime, IANAZone } from 'luxon'
import { Goal } from '../models'
import { GoalCreateOptions, GoalDurations } from '../types'
import { Snowflake } from 'discord.js'

/**
  * Creates a new goal from the arguments passed to the command.
  *
  * @param options The details to use when creating the goal
  * @returns the new goal
  */
async function createGoal (options: GoalCreateOptions): Promise<Goal> {
  const goal = new Goal()
  goal.target = options.target

  if (options.ownerId != null) { goal.ownerId = options.ownerId }
  if (options.channelId != null) { goal.channelId = options.channelId }
  if (options.duration != null) { goal.goalDuration = options.duration }
  if (options.type != null) { goal.goalType = options.type }

  goal.expectedEndAt = estimateCompletionDate(options.timezone, goal.goalDuration)

  return await goal.save()
}

/**
  * Looks for an active goal for the given user.
  *
  * @param userId The discord ID of the user to find the goal for
  */
async function activeGoalForUser (userId: Snowflake): Promise<Goal | null> {
  const userGoals = await Goal.find({
    where: { ownerId: userId },
    order: { createdAt: 'DESC' } // is this right???
  })

  const activeGoals = userGoals.filter((goal) => goal.isActive())

  if (activeGoals.length === 0) {
    return null
  } else {
    return activeGoals[0]
  }
}

async function allActive (): Promise<Goal[]> {
  return await Goal.find({ where: 'Goal.completed_at IS NULL AND Goal.canceled_at IS NULL' })
}

function estimateCompletionDate (timezone: IANAZone, goalDuration: GoalDurations): DateTime {
  const startDate = DateTime.local().setZone(timezone)

  switch (goalDuration) {
    case GoalDurations.DAILY:
      return startDate.endOf('day')
    case GoalDurations.WEEKLY:
      return startDate.endOf('week')
    case GoalDurations.MONTHLY:
      return startDate.endOf('month')
    case GoalDurations.YEARLY:
      return startDate.endOf('year')
  }
}

export const GoalService = {
  activeGoalForUser,
  allActive,
  createGoal
}
