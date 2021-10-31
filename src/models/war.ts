import { Challenge } from './bases/challenge'
import { Column, Entity, OneToOne } from 'typeorm'
import { ChallengeController } from '.'

@Entity({ name: 'wars' })
export class War extends Challenge {
  /**
   * The amount of time, in minutes, the war should last.
   *
   * default = 10 minutes
   */
  @Column({ name: 'duration' })
  duration = 10

  /**
   * Challenge controller instance, contains the universal challenge id
   * as well as a list of users and channels joined to the challenge
   */
  @OneToOne(() => ChallengeController, challengeController => challengeController.war)
  universalId!: ChallengeController
}
