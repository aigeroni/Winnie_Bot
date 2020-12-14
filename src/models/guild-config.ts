import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'
import { IANAZone } from 'luxon'
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
   *
   * Channel where Winnie sends daily goals and other announcements
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
   * The locale to use for messages sent to this guild
   */
  @Column({
    default: 'en',
    length: 2,
    type: 'varchar',
  })
  locale = 'en'

  /**
   * A default timezone for the guild.
   *
   * Takes the format of an IANA timezone identifier, examples:
   * America/Winnipeg
   * Australia/Perth
   * Europe/Zurich
   */
  @Column({
    length: 45,
    type: 'varchar',
  })
  timezone?: IANAZone

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
