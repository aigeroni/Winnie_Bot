import { MaxLength } from 'class-validator'
import { Snowflake } from 'discord.js'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { ChallengeController } from './challenge-controller'
import { RaceTypes } from '../types'
import { BaseModel } from './bases/base-model'
import { DateTime } from 'luxon'
import { NullableDateTimeTransformer } from './transformers/date-time'

/**
 * Represents a user joined to a challenge.
 */
@Entity({ name: 'challenge_users' })
export class ChallengeUser extends BaseModel {
  /**
   * The challenge controller
   */
  @ManyToOne(() => ChallengeController, challengeController => challengeController.users, { primary: true })
  @JoinColumn({ name: 'challenge_id' })
  challengeController!: number

  /**
   * The user's discord Id
   */
  @PrimaryColumn({ name: 'user_id' })
  @MaxLength(30)
  userId!: Snowflake

  /**
   * The Discord ID of the channel which the user joined from
   */
  @Column()
  @MaxLength(30)
  channelId!: Snowflake

  /**
   * The user's total for the challenge
   */
  @Column()
  total: number = 0

  /**
   * The type of the total.
   */
  @Column({ name: 'total_type', type: 'enum', enum: RaceTypes })
  totalType!: RaceTypes

  /**
  * Timestamp of when this mission was canceled.
  *
  * Null if not canceled
  */
  @Column({ name: 'canceled_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  canceledAt?: DateTime

  /**
   * Checks if the mission is canceled.
   *
   * @returns true if the mission is canceled
   */
  isCanceled (): boolean {
    return this.canceledAt != null
  }

  /**
   * Cancels the current join.
   */
  async cancel (): Promise<void> {
    this.canceledAt = DateTime.utc()
    await this.save()
  }

  /**
   * Rejoins the challenge after un-joining.
   */
  async rejoin (newChannelId: Snowflake): Promise<void> {
    this.canceledAt = null
    this.channelId = newChannelId
    await this.save()
  }
}
