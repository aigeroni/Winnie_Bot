import { BaseModel } from './bases/base-model'
import { ChainWar, GuildConfig, UserConfig } from '.'
import { Challenge } from './bases/challenge'
import { ChallengeTotalTypes } from '../types'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { MaxLength, ValidateIf } from 'class-validator'
import { Permissions, Snowflake } from 'discord.js'
import { Project } from './project'
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
