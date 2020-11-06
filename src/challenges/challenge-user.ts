import { Snowflake } from 'discord.js'

/**
 * Represents a user that has joined a challenge
 */
export interface ChallengeUser {

  /**
   * The snowflake of the channel from which the user joined.
   */
  channelID: Snowflake,
}

/**
 * Represents a user that has joined a sprint challenge
 */
export interface SprintUser extends ChallengeUser {

  /**
   * The time at which the user finished the sprint.
   */
  timestampCalled: number,

  /**
   * The time taken to complete the sprint.
   */
  timeTaken: number,
}

/**
 * Represents a user that has joined a war of chain war challenge
 */
export interface WarUser extends ChallengeUser {
  /**
   * The total posted by the user.
   */
  countData: number,

  /**
   * The type of the total.
   */
  countType: string,
}
