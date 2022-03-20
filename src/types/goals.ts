import { IANAZone } from 'luxon'
import { Snowflake } from 'discord.js'
import { TargetTypes } from '.'

/**
 * All possible durations of goals.
 */
export enum GoalDurations {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  YEARLY = 'yearly'
}

/**
  * The options for creating a goal.
  */
export interface GoalCreateOptions {
  guildId?: Snowflake
  ownerId?: Snowflake
  target: number
  type?: TargetTypes
  duration?: GoalDurations
  channelId?: Snowflake
  timezone: IANAZone
  progress: number
}
