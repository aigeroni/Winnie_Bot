import { BaseModel } from './bases/base-model'
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ChainWar, GuildConfig, Project, UserConfig } from '.'
import { Challenge } from './bases/challenge'
import { DateTime } from 'luxon'
import { DateTimeTransformer, NullableDateTimeTransformer } from './transformers/date-time'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsNotEmpty, MaxLength, ValidateIf } from 'class-validator'
import { Permissions, Snowflake } from 'discord.js'
import { StatusTypes, TargetTypes } from '../types'
import { WinnieClient } from '../core'

/**
 * Represents a user joined to a challenge.
 */
@Entity({ name: 'challenge_totals' })
export class ChallengeTotal extends BaseModel {
  /**
   * The challenge to which the user is joined.
   *
   * Part of the primary key, along with userId
   */
  @ManyToOne(() => Challenge, challenge => challenge.id, { primary: true })
  @JoinColumn({ name: 'challenge_id' })
  challenge!: number

  /**
   * The user's discord ID.
   *
   * Part of the primary key, along with the challenge ID.
   */
  @ManyToOne(() => UserConfig, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  userId!: Snowflake

  /**
   * The user's total for the challenge.
   */
  @Column()
  total: number = 0

  /**
   * The type of the total.
   *
   * Can be items, lines, minutes, pages, or words.
   */
  @Column({ name: 'total_type', type: 'enum', enum: TargetTypes })
  totalType!: TargetTypes

  /**
   * The guild from which the user joined the challenge.
   */
  @ManyToOne(() => GuildConfig, guild => guild.id, { primary: true })
  @JoinColumn({ name: 'guild_id' })
  guildId!: Snowflake

  /**
   * The chain that the joined challenge is part of, if any.
   */
  @ManyToOne(() => ChainWar, chain => chain.id)
  @JoinColumn({ name: 'chain_id' })
  chainId!: number

  /**
   * The id of the channel from which the user joined the challenge.
   *
   * Used to construct pings.
   */
  @Column({ name: 'channel_id' })
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake

  /**
   * The id of the project that the total is associated with.
   */
  @ManyToOne(() => Project, project => project.id)
  @JoinColumn({ name: 'project_id' })
  projectId!: Snowflake

  /**
    * The timestamp of when this total was created.
    */
  @Column({ name: 'created_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  createdAt!: DateTime

  /**
    * The timestamp of the most recent time this total was updated.
    *
    * Null if the total has never been updated.
    */
  @Column({ name: 'updated_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  updatedAt?: DateTime

  /**
    * Timestamp of when this total was canceled.
    *
    * Null if not canceled.
    */
  @Column({ name: 'canceled_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  canceledAt?: DateTime

  /**
    * Timestamp of when this total was completed.
    *
    * Null if not completed.
    */
  @Column({ name: 'completed_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  completedAt?: DateTime

  /**
    * The current status of the total.
    *
    * Can be Created, Running (for challenges only), Completed, or Canceled.
    */
  @Column({ type: 'enum', enum: StatusTypes })
  @IsNotEmpty()
  status: StatusTypes = StatusTypes.CREATED

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
    * Checks if the total is active.
    * Active is defined as not completed and not canceled
    *
    * @returns true if the total is active
    */
  isActive (): boolean {
    return !(this.status === StatusTypes.CANCELED || this.status === StatusTypes.COMPLETED)
  }

  /**
    * Checks if the total is completed.
    *
    * @returns true if the total is completed
    */
  isCompleted (): boolean {
    return this.status === StatusTypes.COMPLETED
  }

  /**
    * Checks if the total is canceled.
    *
    * @returns true if the total is canceled
    */
  isCanceled (): boolean {
    return this.status === StatusTypes.CANCELED
  }

  /**
    * Takes the current total and marks it as complete.
    */
  async complete (): Promise<void> {
    this.completedAt = DateTime.utc()
    this.status = StatusTypes.COMPLETED
    await this.save()
  }

  /**
    * Takes the current total and marks it as canceled.
    */
  async cancel (): Promise<void> {
    this.canceledAt = DateTime.utc()
    this.status = StatusTypes.CANCELED
    await this.save()
  }

  /**
    * Rejoins a challenge.
    */
  async rejoin (channelId: Snowflake, guildId: Snowflake): Promise<void> {
    this.channelId = channelId
    this.guildId = guildId
    this.canceledAt = undefined
    this.status = StatusTypes.CREATED
    await this.save()
  }
}
