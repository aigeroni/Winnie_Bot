import { Column, Entity, PrimaryColumn } from 'typeorm'
import { BaseModel } from './bases/base-model'

/**
 * Stores date and time periods for raptor leaderboards.
 */
@Entity()
export class PeriodConfig extends BaseModel {
  /**
   * The ID of the period (in yyyy-mm format)
   */
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  /**
   * The year of the period.
   */
  @Column()
  year!: number

  /**
   * The month of the period.
   */
  @Column()
  month!: number

  /**
   * A text string describing the period.
   */
  @Column({ name: 'period_text', type: 'varchar' })
  periodText!: string

  /**
   * A text string describing any outages or data loss on Winnie during the period.
   */
   @Column({ name: 'period_note', type: 'varchar' })
   periodNote!: string
}
