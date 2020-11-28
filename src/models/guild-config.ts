import { BaseEntity, Column, Entity } from 'typeorm'
import { Snowflake } from 'discord.js'

/**
 * Stores various settings specific to a guild.
 */
@Entity()
export class GuildConfig extends BaseEntity {
  /**
   * The Discord ID of the guild this configuration object represents.
   */
  @Column({
    length: 30,
    primary: true,
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  id: Snowflake

  /**
   * The string which should be used as the command prefix for this guild
   */
  @Column({
    length: 3,
    type: 'varchar',
    nullable: false,
    default: '!',
  })
  prefix = '!'

  /**
   * The Discord ID of the channel in which announcements should be sent.
   */
  @Column({
    length: 30,
    type: 'varchar',
  })
  announcementsChannelId?: Snowflake

  /**
   * Whether or not challenges created in this guild are automatically hidden
   */
  @Column({
    type: 'bool',
    default: true,
    nullable: false,
  })
  cross_guild = true

  /**
   * Whether or not summaries of challenges are automatically posted.
   */
  @Column({
    type: 'bool',
    default: true,
    nullable: false,
  })
  auto_summaries = true

  constructor(id: Snowflake) {
    super()

    this.id = id
  }
}
