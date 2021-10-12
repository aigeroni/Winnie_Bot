import { Logger } from '../core'
import { Goal, Raptor } from '../models'
import { GoalDurations } from '../types'

async function awardRaptorForGoal (goal: Goal): Promise<void> {
  const goalCompletionPercentage = Math.round((goal.progress / goal.target) * 100)
  if (goalCompletionPercentage <= 0) { return }
  if (goalCompletionPercentage >= 100) {
    await awardRaptorForGoalDuration(goal)
    return
  }

  const raptorChance = Math.round(Math.random() * 100)

  if (raptorChance < goalCompletionPercentage) {
    await awardRaptorForGoalDuration(goal)
  }
}

async function awardRaptorForGoalDuration (goal: Goal): Promise<void> {
  const guild = await goal.getGuild()
  if (guild == null) {
    Logger.error(`Unable to assign raptors for goal with id ${goal.id}. Guild lookup failed`)
    return
  }

  const raptor = await Raptor.findOrCreate(goal.ownerId, guild.id)

  switch (goal.goalDuration) {
    case GoalDurations.DAILY:
      await raptor.awardWhiteRaptor()
      break
    case GoalDurations.WEEKLY:
      await raptor.awardBlueRaptor()
      break
    case GoalDurations.MONTHLY:
      await raptor.awardPurpleRaptor()
      break
    case GoalDurations.YEARLY:
      await raptor.awardOrangeRaptor()
      break
  }
}

export const RaptorService = {
  awardRaptorForGoal
}
