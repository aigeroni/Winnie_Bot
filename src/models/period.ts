import { BaseModel } from './bases/base-model'
import { Column, Entity, PrimaryColumn } from 'typeorm'
import { Max, MaxLength, Min } from 'class-validator'

/**
 * A model for tracking projects, goals, challenges, and raptors by month.
 */
@Entity({ name: 'period_config' })
export class Period extends BaseModel {
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

  static async findOrCreate (year: number, month: number): Promise<Period> {
    let period = (await Period.find({ where: { year, month } }))[0]
    if (period != null) { return period }

    // for January-September, we need to pad the month to fit yyyy-mm format
    let monthString = month.toString()
    if (monthString.length === 1) {
      monthString = '0' + monthString
    }
    const currentPeriod = year.toString() + '-' + monthString

    period = new Period()
    period.id = currentPeriod
    period.year = year
    period.month = month
    await period.save()

    return period
  }
}
