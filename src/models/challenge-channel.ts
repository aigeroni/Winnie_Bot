import { Permissions, Snowflake } from 'discord.js'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './bases/base-model'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { ValidateIf, MaxLength } from 'class-validator'
import { WinnieClient } from '../core'
import { ChallengeController } from './challenge-controller'

/**
 * Represents a channel joined to a challenge.
 */
@Entity({ name: 'challenge_channels' })
export class ChallengeChannel extends BaseModel {
  /**
   * The challenge controller
   */
  @ManyToOne(() => ChallengeController, challengeController => challengeController.channels)
  @JoinColumn({ name: 'challenge_id' })
  challengeController!: number

  /**
   * The channel's discord Id
   */
  @Column({ name: 'channel_id' })
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake
}
