import { BaseModel } from './bases/base-model'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import { MaxLength, Min } from 'class-validator'
import { Snowflake } from 'discord.js'

/**
 * A model for keeping track of how many raptors a user has hatched in a given guild.
 */
@Entity({ name: 'raptors' })
export class Raptor extends BaseModel {
  /**
   * The guild in which these raptors have been earned.
   *
   * Part of the table's primary key, along with userId.
   */
  @PrimaryColumn({ name: 'guild_id', type: 'varchar' })
  @MaxLength(30)
  guildId!: Snowflake

  /**
   * The user which has earned these raptors.
   *
   * Part of the table's primary key, along with guildId.
   */
  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  @MaxLength(30)
  userId!: Snowflake

  /**
   * The number of blue raptors this user has earned in this server
   *
   * Awarded for completing weekly goals.
   */
  @Column({ name: 'blue_raptors' })
  @Min(0)
  blue: number = 0

  /**
   * The number of green raptors this user has earned in this server
   *
   * Awarded for completing challenges.
   */
  @Column({ name: 'green_raptors' })
  @Min(0)
  green: number = 0

  /**
   * The number of orange raptors this user has earned in this server
   *
   * Awarded for completing yearly goals.
   */
  @Column({ name: 'orange_raptors' })
  @Min(0)
  orange: number = 0

  /**
   * The number of purple raptors this user has earned in this server
   *
   * Awarded for completing monthly goals.
   */
  @Column({ name: 'purple_raptors' })
  @Min(0)
  purple: number = 0

  /**
   * The number of white raptors this user has earned in this server
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

  static async findOrCreate (userId: Snowflake, guildId: Snowflake): Promise<Raptor> {
    let raptor = (await Raptor.find({ where: { userId, guildId } }))[0]
    if (raptor != null) { return raptor }

    raptor = new Raptor()
    raptor.userId = userId
    raptor.guildId = guildId
    await raptor.save()

    return raptor
  }
}
