import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'
import { IANAZone } from 'luxon'
import { Snowflake } from 'discord.js'

/**
 * Stores various settings specific to a user.
 */
@Entity()
export class UserConfig extends BaseEntity {
  /**
   * The Discord ID of the user this configuration object represents.
   */
  @PrimaryColumn({
    length: 30,
    type: 'varchar',
  })
  id!: Snowflake

  /**
   * The timezone the user is in, used for hatching raptors.
   *
   * Takes the format of an IANA timezone identifier, examples:
   * America/Winnipeg
   * Australia/Perth
   * Europe/Zurich
   */
  @Column({
    length: 45,
    nullable: true,
    type: 'varchar',
  })
  timezone?: IANAZone

  /**
   * The user's name on the NaNoWriMo site.
   */
  @Column({
    name: 'nano_site_name',
    nullable: true,
    type: 'varchar',
  })
  nanoSiteName?: string

  /**
   * Whether or not challenges created by this user are automatically hidden.
   *
   * Can be overridden by GuildConfig#crossGuild
   */
  @Column({
    name: 'cross_guild',
    default: true,
    type: 'bool',
  })
  crossGuild = true

  /**
   * Finds the config object for a given user id.
   * If no config exists, creates a new one.
   *
   * @param id - The id of the user
   */
  static async findOrCreate(id: Snowflake): Promise<UserConfig> {
    let config = await UserConfig.findOne(id)
    if (config) { return config }

    config = new UserConfig()
    config.id = id
    await config.save()

    return config
  }
}