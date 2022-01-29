import { TextChannel } from 'discord.js'
import { DateTime, IANAZone } from 'luxon'
import { I18n, Logger, WinnieClient } from '../core'
import { Goal, GuildConfig, Raptor } from '../models'
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

  const aoeIana = new IANAZone('Etc/GMT+12')
  const currentDate = DateTime.utc().setZone(aoeIana)
  const month = currentDate.get('month')
  const year = currentDate.get('year')
  const raptor = await Raptor.findOrCreate(goal.ownerId, guild.id, month, year)

  switch (goal.goalDuration) {
    case GoalDurations.DAILY:
      await raptor.awardWhiteRaptor() 
      await announceRaptor(goal, raptor, 'goals:raptors.announceWhiteRaptor')
      break
    case GoalDurations.WEEKLY:
      await raptor.awardBlueRaptor()
      await announceRaptor(goal, raptor, 'goals:raptors.announceBlueRaptor')
      break
    case GoalDurations.MONTHLY:
      await raptor.awardPurpleRaptor()
      await announceRaptor(goal, raptor, 'goals:raptors.announcePurpleRaptor')
      break
    case GoalDurations.YEARLY:
      await raptor.awardOrangeRaptor()
      await announceRaptor(goal, raptor, 'goals:raptors.announceOrangeRaptor')
      break
  }
}

async function announceRaptor (goal: Goal, raptor: Raptor, messageKey: string): Promise<void> {
  if (!WinnieClient.isLoggedIn()) { return }

  const channel = (await WinnieClient.client.channels.fetch(goal.channelId)) as TextChannel
  if (channel == null) { return }

  const guildConfig = await GuildConfig.findOrCreate(raptor.guildId)
  const message = await I18n.translate(guildConfig.locale, messageKey, {
    user: `<@${raptor.userId}>`
  })

  try {
    await channel.send(message)
  } catch (error) {
    Logger.error(`Unable to announce raptors in channel ${goal.channelId}`)
  }
}

export const RaptorService = {
  awardRaptorForGoal
}
