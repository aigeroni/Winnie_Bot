import { IANAZone } from 'luxon'
import { Snowflake } from 'discord.js'

/**
 * All the types of goals settable.
 */
export enum GoalTypes {
  ITEMS = 'items',
  LINES = 'lines',
  MINUTES = 'minutes',
  PAGES = 'pages',
  WORDS = 'words',
}

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
  ownerId?: Snowflake
  target: number
  type?: GoalTypes
  duration?: GoalDurations
  channelId?: Snowflake
  timezone: IANAZone
  progress: number
}
