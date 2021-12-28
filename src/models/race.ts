import { Challenge } from './bases/challenge'
import { Column, Entity } from 'typeorm'
import { IsNotEmpty, IsPositive } from 'class-validator'
import { RaceTypes } from '../types'

@Entity({ name: 'challenges' })
export class Race extends Challenge {
  /**
   * The target for the race.
   *
   * example: 5 pages
   */
  @Column()
  @IsPositive()
  target!: number

  /**
    * The type of goal for which the user is aiming.
    *
    * Can be one of pages, words, minutes, lines, or items
    */
  @Column({ name: 'target_type', type: 'enum', enum: RaceTypes })
  @IsNotEmpty()
  targetType: RaceTypes = RaceTypes.WORDS

  /**
   * The amount of time, in minutes, before the race should time out if not completed.
   *
   * default = 30 minutes
   */
  @Column({ name: 'duration' })
  duration: number = 30
}
