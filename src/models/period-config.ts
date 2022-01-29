import { BaseModel } from './bases/base-model'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import { Max, MaxLength, Min } from 'class-validator'
import { Logger } from '../core'

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
  period_note!: string

  static async findOrCreate (year: number, month: number): Promise<PeriodConfig> {
    let period = (await PeriodConfig.find({ where: { year, month } }))[0]
    if (period != null) { return period }

    // for January-September, we need to pad the month to fit yyyy-mm format
    let monthString = month.toString()
    if (monthString.length === 1) {
      monthString = '0' + monthString
    }
    const currentPeriod = year.toString() + '-' + monthString

    Logger.info('period data generated')
    period = new PeriodConfig()
    period.id = currentPeriod
    period.year = year
    period.month = month
    Logger.info('about to save')
    await period.save()
    Logger.info('saved')

    return period
  }
}
