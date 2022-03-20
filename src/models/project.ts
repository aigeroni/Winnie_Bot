import { Column, Entity } from 'typeorm'
import { DateTime } from 'luxon'
import { DateTimeTransformer } from './transformers/date-time'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsNotEmpty, IsPositive, MaxLength, Min, ValidateIf } from 'class-validator'
import { Mission } from './bases/mission'
import { Permissions, Snowflake } from 'discord.js'
import { TargetTypes } from '../types'
import { WinnieClient } from '../core'

@Entity({ name: 'projects' })
export class Project extends Mission {
  /**
   * The project's name, used in project views.
   */
  @Column()
  @MaxLength(150)
  // Cannot contain profanity
  // Cannot mention entities
  // Cannot contain URLs
  name!: string

  /**
   * The target for the project.
   *
   * example: 80000 words, 400 pages
   */
  @Column()
  @IsPositive()
  target!: number

  /**
   * The type of goal for which the user is aiming for this project.
   *
   * Can be one of pages, words, minutes, lines, or items
   */
  @Column({ name: 'goal_type', type: 'enum', enum: TargetTypes })
  @IsNotEmpty()
  goalType: TargetTypes = TargetTypes.WORDS

  /**
   * The progress towards completing the project.
   *
   * example: 73 out of 120 pages
   */
  @Column()
  @Min(0)
  progress: number = 0

  /**
   * The id of the channel in which the project was created.
   *
   * Used for sending messages about the project's status later.
   */
  @Column({ name: 'channel_id' })
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake

  /**
   * The due date of the project.
   */
  @Column({ name: 'due_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  dueAt!: DateTime
}
