import { BaseModel } from './bases/base-model'
import { ChallengeController } from './challenge-controller'
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { MaxLength, ValidateIf } from 'class-validator'
import { Permissions, Snowflake } from 'discord.js'
import { WinnieClient } from '../core'

/**
 * Represents a channel joined to a challenge.
 */
@Entity({ name: 'challenge_channels' })
export class ChallengeChannel extends BaseModel {
  /**
   * The challenge controller
   */
  @ManyToOne(() => ChallengeController, challengeController => challengeController.channels, { primary: true })
  @JoinColumn({ name: 'challenge_id' })
  challengeController!: number

  /**
   * The channel's discord Id
   */
  @PrimaryColumn({ name: 'channel_id' })
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake
}
