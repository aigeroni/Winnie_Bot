import { Challenge } from './bases/challenge'
import { Column, Entity } from 'typeorm'
import { IsNotEmpty, IsPositive } from 'class-validator'
import { TargetTypes } from '../types'

@Entity({ name: 'challenges' })
export class Race extends Challenge {
  /**
   * The challenge name as a localisation key.
   */
  challenge_type = 'race'

  /**
   * The target for the race.
   *
   * example: 5 pages
   */
  @Column()
  @IsPositive()
  target!: number

  /**
   * The type of goal for which entrants are aiming.
   *
   * Can be one of pages, words, minutes, lines, or items
   */
  @Column({ name: 'target_type', type: 'enum', enum: TargetTypes })
  @IsNotEmpty()
  targetType: TargetTypes = TargetTypes.WORDS

  /**
   * The amount of time, in minutes, before the race should time out if not completed.
   *
   * default = 30 minutes
   */
  @Column({ name: 'duration' })
  duration: number = 30
}
