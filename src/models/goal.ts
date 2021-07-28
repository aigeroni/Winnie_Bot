import { BaseModel } from './base-model'
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { DateTime } from 'luxon'
import { GoalDurations, GoalTypes } from '../types'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsNotEmpty, IsPositive, MaxLength, Min } from 'class-validator'
import { Permissions, Snowflake } from 'discord.js'

/**
  * Typeorm transformer for converting ISO timestamps to
  * DateTime objects from Luxon.
  */
const dateTransformer = {
  to: (value: DateTime) => value?.toISO(),
  from: (value: string) => value === null ? null : DateTime.fromISO(value)
}

/**
 * Represents a goal users can set.
 */
@Entity({ name: 'goals' })
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
  @IsPositive()
  target!: number

  /**
   * The type of goal for which the user is aiming.
   *
   * Can be one of pages, words, minutes, lines, or items
   */
  @Column({ name: 'goal_type', type: 'enum', enum: GoalTypes })
  @IsNotEmpty()
  goalType: GoalTypes = GoalTypes.WORDS

  /**
   * The progress towards completing the goal.
   *
   * example: 3 out of 5 pages
   */
  @Column({ type: 'int' })
  @Min(0)
  progress = 0

  /**
   * The goals duration, how long the user has to complete their goal.
   *
   * Can be one of daily, monthly, weekly, or yearly
   */
  @Column({ name: 'goal_duration', type: 'enum', enum: GoalDurations })
  @IsNotEmpty()
  goalDuration: GoalDurations = GoalDurations.DAILY

  /**
   * The id of the user that set the goal.
   */
  @Column({ name: 'owner_id' })
  @MaxLength(30)
  ownerId!: Snowflake

  /**
   * The id of the channel in which the goal was set.
   *
   * Used for sending messages about the goal's status later.
   */
  @Column({ name: 'channel_id' })
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake

  /**
    * The timestamp of when this goal was created.
    */
  @Column({
    name: 'created_at',
    transformer: {
      ...dateTransformer,
      from: (value: string) => DateTime.fromISO(value)
    },
    type: 'varchar'
  })
  createdAt!: DateTime

  /**
  * The timestamp of the most recent time this goal was updated.
  */
  @Column({ name: 'updated_at', transformer: dateTransformer, type: 'varchar' })
  updatedAt?: DateTime

  /**
 * Timestamp of when this goal was canceled.
 *
 * Null if not canceled
 */
  @Column({ name: 'canceled_at', transformer: dateTransformer, type: 'varchar' })
  canceledAt?: DateTime

  /**
 * Timestamp of when this goal was completed.
 *
 * Null if not completed
 */
  @Column({ name: 'completed_at', transformer: dateTransformer, type: 'varchar' })
  completedAt?: DateTime

  /**
   * Listener for the beforeInsert event.
   *
   * Sets the created at timestamp.
   */
  @BeforeInsert()
  onBeforeInsert (): void {
    this.createdAt = DateTime.local()
  }

  /**
   * Listener for the beforeUpdate event.
   *
   * Sets the updated at timestamp.
   */
  @BeforeUpdate()
  onBeforeUpdate (): void {
    this.updatedAt = DateTime.local()
  }
}
