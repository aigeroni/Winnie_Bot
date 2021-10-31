import { MaxLength } from 'class-validator'
import { Snowflake } from 'discord.js'
import { Column } from 'typeorm'
import { Mission } from './mission'
import { DateTime } from 'luxon'
import { DateTimeTransformer } from '../transformers/date-time'

/**
 * The base class for all challenges
 */
export abstract class Challenge extends Mission {
  /**
   * The challenge's name, used in challenge lists.
   */
  @Column({ name: 'name' })
  @MaxLength(150)
  // Cannot contain profanity
  // Cannot mention entities
  // Cannot contain URLs
  name!: string

  /**
   * Whether or not the challenge should show up in challenge lists.
   */
  @Column({ name: 'visible' })
  isVisible = true

  /**
   * When the challenge should start
   */
  @Column({ name: 'start_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  startAt!: DateTime

  /**
   * Whether of not the challenge has started
   */
  @Column({ name: 'has_started' })
  hasStarted = false

  /**
   * The ID of the user that created the challenge.
   */
  @Column({ name: 'created_by' })
  @MaxLength(30)
  createdBy!: Snowflake

  /**
   * Marks the challenge as started
   */
  async start (): Promise<void> {
    this.hasStarted = true

    await this.save()
  }
}
