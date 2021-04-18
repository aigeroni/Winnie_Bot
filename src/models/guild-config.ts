import { BaseModel } from './base-model'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import { I18n } from '../core/i18n'
import { IANAZone } from 'luxon'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsIn, IsOptional, Length, MaxLength } from 'class-validator'
import { IsTimeZone } from './validators/time-zone'
import { Permissions, Snowflake } from 'discord.js'

/**
 * Stores various settings specific to a guild.
 */
@Entity()
export class GuildConfig extends BaseModel {
  /**
   * The Discord ID of the guild this configuration object represents.
   */
  @PrimaryColumn({ type: 'varchar' })
  @MaxLength(30)
  id!: Snowflake

  /**
   * The string which should be used as the command prefix for this guild
   */
  @Column({ type: 'varchar' })
  @Length(1, 3)
  prefix = '!'

  /**
   * The Discord ID of the channel in which announcements should be sent.
   *
   * Channel where Winnie sends daily goals and other announcements
   */
  @Column({ name: 'announcements_channel_id', type: 'varchar' })
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  @IsOptional()
  announcementsChannelId?: Snowflake

  /**
   * Whether or not challenges created in this guild are automatically hidden
   */
  @Column({ name: 'cross_guild', type: 'bool' })
  crossGuild = true

  /**
   * The locale to use for messages sent to this guild
   */
  @Column({ type: 'varchar' })
  @IsIn(I18n.SUPPORTED_LANGUAGES)
  locale = 'en'

  /**
   * A default timezone for the guild.
   *
   * Takes the format of an IANA timezone identifier, examples:
   * America/Winnipeg
   * Australia/Perth
   * Europe/Zurich
   */
  @Column({ type: 'varchar' })
  @IsOptional()
  @IsTimeZone()
  timezone?: IANAZone

  /**
   * Finds the config object for a given guild id.
   * If no config exists, creates a new one.
   *
   * @param id - The id of the guild
   */
  static async findOrCreate (id: Snowflake): Promise<GuildConfig> {
    let config = await GuildConfig.findOne(id)
    if (config != null) { return config }

    config = new GuildConfig()
    config.id = id
    await config.save()

    return config
  }
}
