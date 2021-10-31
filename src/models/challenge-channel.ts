import { Permissions, Snowflake } from 'discord.js'
import { Column, Entity } from 'typeorm'
import { BaseModel } from './bases/base-model'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { ValidateIf, MaxLength } from 'class-validator'
import { WinnieClient } from '../core'

/**
 * Represents a channel joined to a challenge.
 */
@Entity({ name: 'challenge_channels' })
export class ChallengeChannel extends BaseModel {
  /**
   * The universal challenge id
   */
  @Column({ name: 'challenge_id', type: 'int' })
  challengeId!: number

  /**
   * The channel's discord Id
   */
  @Column({ name: 'channel_id' })
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake
}
