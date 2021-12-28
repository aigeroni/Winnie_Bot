import { MaxLength } from 'class-validator'
import { Snowflake } from 'discord.js'
import { Column } from 'typeorm'
import { Mission } from './mission'
import { DateTime } from 'luxon'
import { DateTimeTransformer } from '../transformers/date-time'
import { ChallengeTypes, StatusTypes } from '../../types'

/**
 * The base class for all challenges
 */
export abstract class Challenge extends Mission {
  /**
   * The challenge's name.
   *
   * Used in challenge lists.
   */
  @Column()
  @MaxLength(150)
  // Cannot contain profanity
  // Cannot mention entities
  // Cannot contain URLs
  name!: string

  /**
   * Whether or not the challenge should show up in challenge lists.
   */
  @Column({ name: 'is_visible' })
  isVisible: boolean = true

  /**
   * When the challenge should start.
   */
  @Column({ name: 'start_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  startAt!: DateTime

  /**
   * The list of channels that the challenge prints to.
   */
  @Column({ type: 'varchar', array: true })
  channels!: Snowflake[]

  /**
   * The type of the challenge; either war or race.  Null for chains.
   */
  @Column({ name: 'challenge_type' })
  challengeType?: ChallengeTypes

  /**
   * Marks the challenge as started
   */
  async start (): Promise<void> {
    this.status = StatusTypes.RUNNING

    await this.save()
  }
}
