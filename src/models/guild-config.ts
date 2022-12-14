import { BaseModel } from './bases/base-model'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import { I18n } from '../core'
import { IANAZone } from 'luxon'
import { IsChannelWithPermission } from './validators/channel-with-permission'
import { IsIn, IsOptional, MaxLength } from 'class-validator'
import { IsTimeZone } from './validators/time-zone'
import { PermissionsBitField, Snowflake } from 'discord.js'

/**
 * Stores various settings specific to a guild.
 */
@Entity()
export class GuildConfig extends BaseModel {
  static DEFAULT_LOCALE = I18n.DEFAULT_LOCALE

  /**
   * The Discord ID of the guild this configuration object represents.
   */
  @PrimaryColumn({ type: 'varchar' })
  @MaxLength(30)
  id!: Snowflake

  /**
   * The Discord ID of the channel in which announcements should be sent.
   *
   * Channel where Winnie sends daily goals and other announcements
   */
  @Column({ name: 'announcements_channel_id', type: 'varchar' })
  @IsChannelWithPermission(PermissionsBitField.Flags.SendMessages)
  @MaxLength(30)
  @IsOptional()
  announcementsChannelId?: Snowflake | null

  /**
   * Whether or not challenges created in this guild are automatically hidden
   */
  @Column({ name: 'cross_guild' })
  crossGuild: boolean = true

  /**
   * The locale to use for messages sent to this guild
   */
  @Column({ type: 'varchar' })
  @IsIn(I18n.SUPPORTED_LANGUAGES)
  locale = GuildConfig.DEFAULT_LOCALE

  /**
   * A default timezone for the guild.
   *
   * Takes the format of an IANA timezone identifier, examples:
   * America/Winnipeg
   * Australia/Perth
   * Europe/Zurich
   */
  @Column({
    type: 'varchar',
    transformer: {
      to: (value: IANAZone) => value?.name,
      from: (value: string) => value === null ? null : new IANAZone(value)
    }
  })
  @IsTimeZone()
  @IsOptional()
  timezone?: IANAZone | null

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
