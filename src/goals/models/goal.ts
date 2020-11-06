import GoalCache from '../goal-cache'
import GoalTypes from './goal-types'
import { Client, Snowflake, TextChannel } from 'discord.js'

declare const client: Client

// const dbc = require('../dbc.js');

/** Represents a goal. */
export default class Goal {

  authorID: Snowflake
  channel: TextChannel
  goal: number
  goalType: GoalTypes
  startTime: number
  terminationTime: number
  written: number

  /**
   * Create a goal.
   *
   * @param authorID - The Discord ID of the goal setter.
   * @param goal - The goal that the user is trying to reach.
   * @param goalType - The type of goal that the user is trying to reach.
   * @param written - The user's progress towards their goal.
   * @param startTime - UNIX timestamp of the second the goal was set.
   * @param terminationTime - UNIX timestamp of the second the goal will resolve.
   * @param channelID - Discord ID of start channel.
   */
  constructor(
    authorID: Snowflake,
    goal: number,
    goalType: GoalTypes,
    written: number,
    startTime: number,
    terminationTime: number,
    channelID: Snowflake,
  ) {
    this.authorID = authorID
    this.goal = goal
    this.goalType = goalType
    this.written = written
    this.startTime = startTime
    this.terminationTime = terminationTime
    this.channel = client.channels.get(channelID) as TextChannel

    const goalData = {
      authorID: this.authorID,
      goal: this.goal,
      goalType: this.goalType,
      written: this.written,
      startTime: this.startTime,
      terminationTime: this.terminationTime,
      channelID: this.channel.id,
    }
    dbc.dbUpdate('goalDB', {authorID: this.authorID}, goalData)
  }

  /**
   * Check to see whether the goal resolves, and handle it if so.
   *
   * @return The user's chance of hatching a raptor.
   */
  update(): Record<string, TextChannel | number> | undefined {
    const currentTime = new Date().getTime()

    if (currentTime >= this.terminationTime) {
      this.clearGoal()
      return {
        channel: this.channel,
        chance: this.written / this.goal * 100,
      }
    }
  }

  /**
   * Clears a goal from the database.
   */
  async clearGoal(): Promise<void> {
    await dbc.dbRemove('goalDB', { authorID: this.authorID })
    GoalCache.remove(this)
  }

  /**
   * Update the goal with the user's current progress.
   *
   * @param wordNumber - The user's progress towards their goal.
   * @param overwrite - Whether to overwrite the user's progress with the
   *   given total (true), or add it to their existing progress (false).
   */
  async addWords(wordNumber: number, overwrite: boolean): Promise<void> {
    if (overwrite) {
      this.written = wordNumber
    } else {
      this.written = wordNumber
    }

    await dbc.dbUpdate('goalDB', {authorID: this.authorID}, {
      $set: {
        written: this.written,
      },
    })
  }
}
