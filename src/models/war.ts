import { Challenge } from './bases/challenge'
import { Column, Entity } from 'typeorm'

@Entity({ name: 'wars' })
export class War extends Challenge {
  /**
   * The amount of time, in minutes, the war should last.
   *
   * default = 10 minutes
   */
  @Column({ name: 'duration' })
  duration = 10
}
