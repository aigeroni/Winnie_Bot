import { BaseModel } from './bases/base-model'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import { DateTime, IANAZone } from 'luxon'
import { IsOptional, Max, MaxLength, Min } from 'class-validator'

/**
 * A model for tracking projects, goals, challenges, and raptors by month.
 */
@Entity()
export class PeriodConfig extends BaseModel {
  /**
   * The ID of the period.  ISO-formatted year and month (yyyy-mm)
   *
   * Part of the table's primary key, along with year and month.
   */
  @PrimaryColumn({ type: 'varchar' })
  @MaxLength(7)
  id!: string

  /**
   * The year of the period.
   *
   * Part of the table's primary key, along with id and month.
   */
  @PrimaryColumn()
  @Min(2020)
  year!: number

  /**
   * The month of the period.
   *
   * Part of the table's primary key, along with id and year.
   */
  @PrimaryColumn()
  @Min(1)
  @Max(12)
  month!: number

  /**
   * A text description of the period.
   */
  @Column({ name: 'period_text', type: 'varchar' })
  @MaxLength(20)
  periodText!: string

  /**
   * Any unusual events that happened during the period.
   */
  @Column({ name: 'period_note', type: 'varchar' })
  @MaxLength(150)
  @IsOptional()
  periodNote?: string | null

  static async findOrCreate (): Promise<PeriodConfig> {
    // We currently use Anywhere on Earth for our periods.
    // This saves us from having to deal with leaderboards resetting at different times.
    const aoeIana = new IANAZone('Etc/GMT+12')
    const currentDate = DateTime.utc().setZone(aoeIana)
    const month = currentDate.get('month')
    const year = currentDate.get('year')

    // check for whether the period already exists
    let period = (await PeriodConfig.find({ where: { year, month } }))[0]
    if (period != null) { return period }

    // for January-September, we need to pad the month to fit yyyy-mm format
    let monthString = month.toString()
    if (monthString.length === 1) {
      monthString = '0' + monthString
    }
    const currentPeriod = year.toString() + '-' + monthString

    // populate the human-readable period string used on leaderboards
    const periodData = currentDate.monthLong + ' ' + year.toString()

    // create and save period row
    period = new PeriodConfig()
    period.id = currentPeriod
    period.year = year
    period.month = month
    period.periodText = periodData
    await period.save()

    return period
  }
}
