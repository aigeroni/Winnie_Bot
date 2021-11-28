import { MaxLength, ValidateIf } from 'class-validator'
import { Permissions, Snowflake } from 'discord.js'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { ChainWar, GuildConfig, UserConfig } from '.'
import { WinnieClient } from '../core'
import { ChallengeTotalTypes } from '../types'
import { BaseModel } from './bases/base-model'
import { Challenge } from './bases/challenge'
import { Project } from './project'
import { IsChannelWithPermission } from './validators/channel-with-permission'

/**
 * Represents a user joined to a challenge.
 */
@Entity({ name: 'challenge_totals' })
export class ChallengeTotal extends BaseModel {
  /**
   * The challenge to which the user is joined
   * 
   * Part of the primary key, along with userId
   */
  @ManyToOne(() => Challenge, challenge => challenge.id, { primary: true })
  @JoinColumn({ name: 'challenge_id' })
  challenge!: number

  /**
   * The user's discord Id
   * 
   * Part of the primary key, along with the challenge
   */
  @ManyToOne(() => UserConfig, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  userId!: Snowflake

  /**
   * The user's total for the challenge
   */
  @Column()
  total: number = 0

  /**
   * The type of the total.
   */
  @Column({ name: 'total_type', type: 'enum', enum: ChallengeTotalTypes })
  totalType!: ChallengeTotalTypes

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
}
