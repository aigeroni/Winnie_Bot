import { Snowflake } from 'discord.js'

/**
 * All the types of race settable.
 */
export enum RaceTypes {
  ITEMS = 'items',
  LINES = 'lines',
  MINUTES = 'minutes',
  PAGES = 'pages',
  WORDS = 'words',
}

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
  type: RaceTypes
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
