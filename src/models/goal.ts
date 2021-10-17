import { BaseModel } from './base-model'
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { DateTime, Duration, Interval } from 'luxon'
import { GoalDurations, GoalTypes } from '../types'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsNotEmpty, IsPositive, MaxLength, Min, ValidateIf } from 'class-validator'
import { I18n, WinnieClient } from '../core'
import { Guild, GuildChannel, Permissions, Snowflake } from 'discord.js'
import { DateTimeTransformer, NullableDateTimeTransformer } from './transformers/date-time'

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
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake

  /**
    * The timestamp of when this goal was created.
    */
  @Column({ name: 'created_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  createdAt!: DateTime

  /**
  * The timestamp of the most recent time this goal was updated.
  *
  * Null if the goal has never been updated.
  */
  @Column({ name: 'updated_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  updatedAt?: DateTime

  /**
 * Timestamp of when this goal was canceled.
 *
 * Null if not canceled
 */
  @Column({ name: 'canceled_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  canceledAt?: DateTime

  /**
 * Timestamp of when this goal was completed.
 *
 * Null if not completed
 */
  @Column({ name: 'completed_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  completedAt?: DateTime

  /**
   * The anticipated time the goal will end, based on the creation time.
   */
  @Column({ name: 'expected_end_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  expectedEndAt!: DateTime

  /**
   * Listener for the beforeInsert event.
   *
   * Sets the created at timestamp.
   */
  @BeforeInsert()
  onBeforeInsert (): void {
    this.createdAt = DateTime.utc()
  }

  /**
   * Listener for the beforeUpdate event.
   *
   * Sets the updated at timestamp.
   */
  @BeforeUpdate()
  onBeforeUpdate (): void {
    this.updatedAt = DateTime.utc()
  }

  /**
    * Gets the end date for the goal.
    *
    * If the goal has ended, returns the date it ended.
    * If the goal is active, returns the expected end date.
    *
    * @returns The end date for the goal
    */
  endDate (): DateTime {
    if (this.canceledAt != null) { return this.canceledAt }
    if (this.completedAt != null) { return this.completedAt }

    return this.expectedEndAt
  }

  /**
   * Return the time remaining until the goal is expected to end.
   *
   * If the goal has ended, the duration will be 0 minutes.
   *
   * @returns A Duration instance representing the time until the goal ends
   */
  timeRemaining (): Duration {
    if (!this.isActive()) { return Duration.fromObject({ minutes: 0 }) }

    const timeRemaining = Interval.fromDateTimes(DateTime.utc(), this.endDate()).toDuration()
    return timeRemaining.shiftTo('months', 'days', 'hours', 'minutes')
  }

  /**
   * Checks if the goal is active.
   * Active is defined as not completed and not canceled
   *
   * @returns true if the goal is active
   */
  isActive (): boolean {
    return !this.isCanceled() && !this.isCompleted()
  }

  /**
   * Checks if the goal is completed.
   *
   * @returns true if the goal is completed
   */
  isCompleted (): boolean {
    return this.completedAt == null
  }

  /**
   * Checks if the goal is canceled.
   *
   * @returns true if the goal is canceled
   */
  isCanceled (): boolean {
    return this.canceledAt == null
  }

  /**
   * Takes the current goal and makes it as complete.
   */
  async complete (): Promise<void> {
    this.completedAt = DateTime.utc()
    await this.save()
  }

  /**
   * Takes the current goal and makes it as canceled.
   */
  async cancel (): Promise<void> {
    this.canceledAt = DateTime.utc()
    await this.save()
  }

  /**
   * Gets the guild this goal was created in
   *
   * @returns The Guild object for the guild this goal was created in.
   *          undefined if the guild was not able to be looked up.
   */
  async getGuild (): Promise<Guild | undefined> {
    if (!WinnieClient.isLoggedIn()) { return }

    const channel = await WinnieClient.client.channels.fetch(this.channelId)
    if (channel == null) { return }

    if (channel instanceof GuildChannel) {
      return channel.guild
    }
  }

  /**
   * Creates a localised string containing the details of the goal.
   *
   * @param locale The locale in which to print the string
   * @returns A localised string representing the goal.
   */
  async print (locale: string): Promise<string> {
    const detailsString = await I18n.translate(locale, 'goals:details', {
      progress: await I18n.translate(locale, `goals:typesWithCount.${this.goalType}`, { count: this.progress }),
      target: this.target,
      type: await I18n.translate(locale, `goals:types.${this.goalType}`)
    })

    const timeRemaining = this.timeRemaining()
    const timeString = await I18n.translate(locale, 'goals:timeRemaining', {
      months: await I18n.translate(locale, 'goals:durationsWithCount.months', { count: Math.round(timeRemaining.months) }),
      days: await I18n.translate(locale, 'goals:durationsWithCount.days', { count: Math.round(timeRemaining.days) }),
      hours: await I18n.translate(locale, 'goals:durationsWithCount.hours', { count: Math.round(timeRemaining.hours) }),
      minutes: await I18n.translate(locale, 'goals:durationsWithCount.minutes', { count: Math.round(timeRemaining.minutes) })
    })

    return await I18n.translate(locale, 'goals:goal', {
      details: detailsString,
      timeRemaining: timeString
    })
  }
}
