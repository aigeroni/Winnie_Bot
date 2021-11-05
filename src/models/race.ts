import { Challenge } from './bases/challenge'
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm'
import { IsNotEmpty, IsPositive } from 'class-validator'
import { RaceTypes } from '../types'
import { ChallengeController } from './challenge-controller'

@Entity({ name: 'races' })
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
  @Column({ name: 'time_out' })
  timeOut: number = 30

  /**
   * Challenge controller instance, contains the universal challenge id
   * as well as a list of users and channels joined to the challenge
   */
  @OneToOne(() => ChallengeController, challengeController => challengeController.race)
  @JoinColumn({ name: 'universal_id' })
  universalId!: ChallengeController | null
}
