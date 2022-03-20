import { Snowflake } from 'discord.js'
import { TargetTypes } from '.'

/**
  * The options for creating a chain war.
  */
export interface ChainWarCreateOptions {
  channelId?: Snowflake
  delay: number
  duration: number
  join: boolean
  chainLength: number
  ownerId?: Snowflake
  name: string
  split: number
}

/**
  * The options for creating a race.
  */
export interface RaceCreateOptions {
  channelId?: Snowflake
  delay: number
  duration: number
  join: boolean
  ownerId?: Snowflake
  name: string
  target: number
  type: TargetTypes
}

/**
  * The options for creating a war.
  */
export interface WarCreateOptions {
  channelId?: Snowflake
  delay: number
  duration: number
  join: boolean
  ownerId?: Snowflake
  name: string
}

/**
 * All the possible statuses for challenges, goals, and projects.
 */
export enum StatusTypes {
  CREATED = 'created',
  RUNNING = 'running',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
}

/**
 * The challenge types.
 */
export enum ChallengeTypes {
  RACE = 'race',
  WAR = 'war',
}
