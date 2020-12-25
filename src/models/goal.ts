import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Snowflake } from 'discord.js'

/**
 * All the types of goals settable.
 */
export enum GoalTypes {
  LINES = 'lines',
  MINUTES = 'minutes',
  PAGES = 'pages',
  WORDS = 'words',
}

/**
 * Represents a goal users can set.
 */
@Entity()
export class Goal extends BaseEntity {
  /**
   * The goal's id.
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The quantity of the goal the user wants to reach.
   *
   * example: 5 pages
   */
  @Column()
  goal!: number

  /**
   * The type of goal for which the user is aiming.
   *
   * Can be one of pages, words, minutes, or lines
   */
  @Column({ name: 'goal_type', type: 'enum', enum: GoalTypes })
  goalType!: GoalTypes

  /**
   * The quantity of successfully goal elements.
   *
   * example: 3 out of 5 pages
   */
  @Column({ type: 'int' })
  written = 0

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
   * Whether or not this goal has been canceled
   */
  @Column({ type: 'bool' })
  canceled = false

  /**
   * Whether or not this goal has been completed
   */
  @Column({ type: 'bool' })
  completed = false
}
