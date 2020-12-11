import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'
import { Snowflake } from 'discord.js'

/**
 * Stores various settings specific to a guild.
 */
@Entity()
export class GuildConfig extends BaseEntity {
  /**
   * The Discord ID of the guild this configuration object represents.
   */
  @PrimaryColumn({
    length: 30,
    type: 'varchar',
  })
  id!: Snowflake

  /**
   * The string which should be used as the command prefix for this guild
   */
  @Column({
    default: '!',
    length: 3,
    type: 'varchar',
  })
  prefix = '!'

  /**
   * The Discord ID of the channel in which announcements should be sent.
   */
  @Column({
    name: 'announcements_channel_id',
    length: 30,
    type: 'varchar',
  })
  announcementsChannelId?: Snowflake

  /**
   * Whether or not challenges created in this guild are automatically hidden
   */
  @Column({
    name: 'cross_guild',
    default: true,
    type: 'bool',
  })
  crossGuild = true

  /**
   * Whether or not summaries of challenges are automatically posted.
   */
  @Column({
    name: 'auto_summaries',
    default: true,
    type: 'bool',
  })
  autoSummaries = true

  /**
   * The locale to use for messages sent to this guild
   */
  @Column({
    default: 'en',
    length: 2,
    type: 'varchar',
  })
  locale = 'en'

  /**
   * Finds the config object for a given guild id.
   * If no config exists, creates a new one.
   *
   * @param id - The id of the guild
   */
  static async findOrCreate(id: Snowflake): Promise<GuildConfig> {
    let config = await GuildConfig.findOne(id)
    if (config) { return config }

    config = new GuildConfig()
    config.id = id
    await config.save()

    return config
  }
}
