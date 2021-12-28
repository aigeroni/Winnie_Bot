import { BaseModel } from './base-model'
import { BeforeInsert, BeforeUpdate, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { DateTime } from 'luxon'
import { DateTimeTransformer, NullableDateTimeTransformer } from '../transformers/date-time'
import { StatusTypes } from '../../types'
import { IsNotEmpty } from 'class-validator'
import { Guild, Snowflake } from 'discord.js'
import { UserConfig } from '..'

/**
 * Abstract class for Goals and Challenges.
 *
 * Handles common functionality regarding timestamps and status
 */
export abstract class Mission extends BaseModel {
  /**
   * The mission's id.
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The current status of the mission.
   * 
   * Can be Created, Running (for challenges only), Completed, or Canceled.
   */
  @Column()
  @IsNotEmpty()
  status: StatusTypes = StatusTypes.CREATED

  /**
   * The id of the guild that the mission belongs to.
   */
  @ManyToOne(() => Guild, guild => guild.id)
  @JoinColumn({ name: 'guild_id' })
  guildId!: Snowflake

  /**
   * The id of the user that created the mission.
   */
  @ManyToOne(() => UserConfig, user => user.id)
  @JoinColumn({ name: 'owner_id' })
  ownerId!: Snowflake

  /**
   * Timestamp of when this mission was created.
   */
  @Column({ name: 'created_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  createdAt!: DateTime

  /**
   * Timestamp of the most recent update to the mission.
   *
   * Null if never updated.
   */
  @Column({ name: 'updated_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  updatedAt?: DateTime

  /**
   * Timestamp of when this mission was canceled.
   *
   * Null if not canceled.
   */
  @Column({ name: 'canceled_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  canceledAt?: DateTime

  /**
   * Timestamp of when this mission was completed.
   *
   * Null if not completed.
   */
  @Column({ name: 'completed_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  completedAt?: DateTime

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
   * Checks if the mission is active.
   * Active is defined as not completed and not canceled
   *
   * @returns true if the mission is active
   */
  isActive (): boolean {
    return !(this.status === StatusTypes.COMPLETED || this.status === StatusTypes.CANCELED)
  }

  /**
   * Checks if the mission is completed.
   *
   * @returns true if the mission is completed
   */
  isCompleted (): boolean {
    return this.completedAt != null
  }

  /**
   * Checks if the mission is canceled.
   *
   * @returns true if the mission is canceled
   */
  isCanceled (): boolean {
    return this.canceledAt != null
  }

  /**
   * Takes the current mission and marks it as complete.
   */
  async complete (): Promise<void> {
    this.completedAt = DateTime.utc()
    this.status = StatusTypes.COMPLETED
    await this.save()
  }

  /**
   * Takes the current mission and marks it as canceled.
   */
  async cancel (): Promise<void> {
    this.canceledAt = DateTime.utc()
    this.status = StatusTypes.CANCELED
    await this.save()
  }
}
