import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Snowflake } from 'discord.js'

/**
 * All the types of goals settable.
 */
enum GoalTypes {
  LINES = 'lines',
  MINUTES = 'minutes',
  PAGES = 'pages',
  WORDS = 'words',
}

/**
 * Represents a goal users can set.
 */
@Entity()
class Goal extends BaseEntity {
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
  @Column({ type: 'int' })
  goal!: number

  /**
   * The type of goal for which the user is aiming.
   *
   * Can be one of pages, words, minutes, or lines
   */
  @Column({
    name: 'goal_type',
    type: 'enum',
    enum: GoalTypes,
  })
  goalType!: GoalTypes

  /**
   * The quantity of successfully goal elements.
   *
   * example: 3 out of 5 pages
   */
  @Column({
    type: 'int',
    default: 0,
  })
  written = 0

  /**
   * The id of the user that set the goal.
   */
  @Column({
    name: 'owner_id',
    length: 30,
    type: 'varchar',
  })
  ownerId!: Snowflake

  /**
   * The id of the channel in which the goal was set.
   *
   * Used for sending messages about the goal's status later.
   */
  @Column({
    name: 'channel_id',
    length: 30,
    type: 'varchar',
  })
  channelId!: Snowflake

  @Column({
    default: false,
    type: 'bool',
  })
  canceled = false

  @Column({
    default: false,
    type: 'bool',
  })
  completed = false
}

export {
  Goal,
  GoalTypes,
}
