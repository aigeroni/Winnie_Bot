import { BaseModel } from './bases/base-model'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Min } from 'class-validator'
import { Snowflake } from 'discord.js'
import { GuildConfig, UserConfig } from '.'
import { PeriodConfig } from './period-config'

/**
 * A model for keeping track of how many raptors a user has hatched in a given guild.
 */
@Entity({ name: 'raptors' })
export class Raptor extends BaseModel {
  /**
   * The guild in which these raptors have been earned.
   *
   * Part of the table's primary key, along with userId and period.
   */
  @ManyToOne(() => GuildConfig, guild => guild.id, { primary: true })
  @JoinColumn({ name: 'guild_id' })
  guildId!: Snowflake

  /**
   * The user which has earned these raptors.
   *
   * Part of the table's primary key, along with guildId and period.
   */
  @ManyToOne(() => UserConfig, user => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  userId!: Snowflake

  /**
   * The period in which the raptors were earned.
   *
   * Part of the table's primary key, along with guildId.
   */
  @ManyToOne(() => PeriodConfig, period => period.id, { primary: true })
  @JoinColumn({ name: 'period_id' })
  periodId!: string

  /**
   * The number of blue raptors this user has earned in this server for a given time period
   *
   * Awarded for completing weekly goals.
   */
  @Column({ name: 'blue_raptors' })
  @Min(0)
  blue: number = 0

  /**
   * The number of green raptors this user has earned in this server for a given time period
   *
   * Awarded for completing challenges.
   */
  @Column({ name: 'green_raptors' })
  @Min(0)
  green: number = 0

  /**
   * The number of orange raptors this user has earned in this server for a given time period
   *
   * Awarded for completing yearly goals.
   */
  @Column({ name: 'orange_raptors' })
  @Min(0)
  orange: number = 0

  /**
   * The number of purple raptors this user has earned in this server for a given time period
   *
   * Awarded for completing monthly goals.
   */
  @Column({ name: 'purple_raptors' })
  @Min(0)
  purple: number = 0

  /**
   * The number of white raptors this user has earned in this server for a given time period
   *
   * Awarded for completing daily goals.
   */
  @Column({ name: 'white_raptors' })
  @Min(0)
  white: number = 0

  /**
   * Awards the user a new blue raptor
   */
  async awardBlueRaptor (): Promise<void> {
    this.blue += 1
    await this.save()
  }

  /**
   * Awards the user a new green raptor
   */
  async awardGreenRaptor (): Promise<void> {
    this.green += 1
    await this.save()
  }

  /**
   * Awards the user a new orange raptor
   */
  async awardOrangeRaptor (): Promise<void> {
    this.orange += 1
    await this.save()
  }

  /**
   * Awards the user a new purple raptor
   */
  async awardPurpleRaptor (): Promise<void> {
    this.purple += 1
    await this.save()
  }

  /**
   * Awards the user a new white raptor
   */
  async awardWhiteRaptor (): Promise<void> {
    this.white += 1
    await this.save()
  }

  static async findOrCreate (userId: Snowflake, guildId: Snowflake, periodId: string): Promise<Raptor> {
    let raptor = (await Raptor.find({ where: { userId, guildId, periodId } }))[0]
    if (raptor != null) { return raptor }

    raptor = new Raptor()
    raptor.userId = userId
    raptor.guildId = guildId
    raptor.periodId = periodId
    await raptor.save()

    return raptor
  }
}
