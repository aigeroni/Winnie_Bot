import { BaseModel } from './bases/base-model'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { IANAZone } from 'luxon'
import { IsOptional, MaxLength } from 'class-validator'
import { IsTimeZone } from './validators/time-zone'
import { Snowflake } from 'discord.js'
import { GuildConfig } from '.'

/**
 * Stores various settings specific to a user.
 */
@Entity()
export class UserConfig extends BaseModel {
  /**
   * The Discord ID of the user this configuration object represents.
   */
  @PrimaryColumn({ type: 'varchar' })
  @MaxLength(30)
  id!: Snowflake

  /**
   * The guild to which the user wants their raptors to hatch.
   */
  @ManyToOne(() => GuildConfig, guild => guild.id)
  @JoinColumn({ name: 'home_guild' })
  homeGuild!: Snowflake

  /**
   * The timezone the user is in, used for hatching raptors.
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
   * Whether or not challenges created by this user are automatically hidden.
   *
   * Can be overridden by GuildConfig#crossGuild
   */
  @Column({ name: 'cross_guild' })
  crossGuild: boolean = true

  /**
   * The number of minutes remaining until the user is guaranteed a challenge raptor.
   */
  @Column({ name: 'minutes_to_raptor' })
  minutesToRaptor: number = 0

  /**
   * Finds the config object for a given user id.
   * If no config exists, creates a new one.
   *
   * @param id - The id of the user
   */
  static async findOrCreate (id: Snowflake): Promise<UserConfig> {
    let config = await UserConfig.findOne(id)
    if (config != null) { return config }

    config = new UserConfig()
    config.id = id
    await config.save()

    return config
  }
}
