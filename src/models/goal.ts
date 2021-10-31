import { Column, Entity } from 'typeorm'
import { DateTime, Duration, Interval } from 'luxon'
import { GoalDurations, GoalTypes } from '../types'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsNotEmpty, IsPositive, MaxLength, Min, ValidateIf } from 'class-validator'
import { I18n, WinnieClient } from '../core'
import { Guild, GuildChannel, Permissions, Snowflake } from 'discord.js'
import { DateTimeTransformer } from './transformers/date-time'
import { Mission } from './bases/mission'

/**
 * Represents a goal users can set.
 */
@Entity({ name: 'goals' })
export class Goal extends Mission {
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
   * The anticipated time the goal will end, based on the creation time.
   */
  @Column({ name: 'expected_end_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  expectedEndAt!: DateTime

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
