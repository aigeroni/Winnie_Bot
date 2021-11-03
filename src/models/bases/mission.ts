import { BaseModel } from './base-model'
import { BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn } from 'typeorm'
import { DateTime } from 'luxon'
import { DateTimeTransformer, NullableDateTimeTransformer } from '../transformers/date-time'

/**
 * Abstract class for Goals and Challenges.
 *
 * Handles common functionality regarding timestamps and status
 */
export abstract class Mission extends BaseModel {
  /**
   * The mission's id.
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
    * The timestamp of when this mission was created.
    */
  @Column({ name: 'created_at', transformer: new DateTimeTransformer(), type: 'varchar' })
  createdAt!: DateTime

  /**
 * The timestamp of the most recent time this mission was updated.
 *
 * Null if the mission has never been updated.
 */
  @Column({ name: 'updated_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  updatedAt?: DateTime

  /**
* Timestamp of when this mission was canceled.
*
* Null if not canceled
*/
  @Column({ name: 'canceled_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  canceledAt?: DateTime

  /**
* Timestamp of when this mission was completed.
*
* Null if not completed
*/
  @Column({ name: 'completed_at', transformer: new NullableDateTimeTransformer(), type: 'varchar' })
  completedAt?: DateTime

  /**
   * Listener for the beforeInsert event.
   *
   * Sets the created at timestamp.
   */
  @BeforeInsert()
  onBeforeInsert (): void {
    this.createdAt = DateTime.utc()
  }

  /**
  * Listener for the beforeUpdate event.
  *
  * Sets the updated at timestamp.
  */
  @BeforeUpdate()
  onBeforeUpdate (): void {
    this.updatedAt = DateTime.utc()
  }

  /**
   * Checks if the mission is active.
   * Active is defined as not completed and not canceled
   *
   * @returns true if the mission is active
   */
  isActive (): boolean {
    return !this.isCanceled() && !this.isCompleted()
  }

  /**
   * Checks if the mission is completed.
   *
   * @returns true if the mission is completed
   */
  isCompleted (): boolean {
    return this.completedAt != null
  }

  /**
   * Checks if the mission is canceled.
   *
   * @returns true if the mission is canceled
   */
  isCanceled (): boolean {
    return this.canceledAt != null
  }

  /**
   * Takes the current mission and makes it as complete.
   */
  async complete (): Promise<void> {
    this.completedAt = DateTime.utc()
    await this.save()
  }

  /**
   * Takes the current mission and makes it as canceled.
   */
  async cancel (): Promise<void> {
    this.canceledAt = DateTime.utc()
    await this.save()
  }
}
