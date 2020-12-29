import { BaseModel } from './base-model'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
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
 * Represents a goal users can set.
 */
@Entity()
export class Goal extends BaseModel {
  /**
   * The goal's id.
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The target for the goal.
   *
   * example: 5 pages
   */
  @Column()
  target!: number

  /**
   * The type of goal for which the user is aiming.
   *
   * Can be one of pages, words, minutes, lines, or items
   */
  @Column({ name: 'goal_type', type: 'enum', enum: GoalTypes })
  goalType: GoalTypes = GoalTypes.WORDS

  /**
   * The progress towards completing the goal.
   *
   * example: 3 out of 5 pages
   */
  @Column({ type: 'int' })
  progess = 0

  /**
   * The id of the user that set the goal.
   */
  @Column({ name: 'owner_id' })
  ownerId!: Snowflake

  /**
   * The id of the channel in which the goal was set.
   *
   * Used for sending messages about the goal's status later.
   */
  @Column({ name: 'channel_id' })
  channelId!: Snowflake

  /**
   * Timestamp of when this goal was canceled.
   *
   * Null if not canceled
   */
  @Column({ name: 'canceled_at' })
  canceledAt?: Date

  /**
   * Timestamp of when this goal was completed.
   *
   * Null if not completed
   */
  @Column({ name: 'completed_at' })
  completedAt?: Date
}
