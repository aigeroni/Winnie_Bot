import { Challenge } from './bases/challenge'
import { Column, Entity, OneToOne } from 'typeorm'
import { ChallengeController } from './challenge-controller'

/**
 * Represents a chain war
 */
@Entity({ name: 'chain_wars' })
export class ChainWar extends Challenge {
  /**
   * How long each war should last, in minutes.
   *
   * If not present, the default war length will be used
   */
  @Column()
  duration?: number

  /**
   * The total number of wars in the chain
   */
  @Column()
  numWars!: number

  /**
   * The current war in the chain
   */
  @Column()
  currentWar!: number

  /**
   * The amount of time, in minutes, between the end of one war
   * and the beginning of the next.
   *
   * default = 5 minutes
   */
  @Column()
  warMargin = 5

  /**
   * Challenge controller instance, contains the universal challenge id
   * as well as a list of users and channels joined to the challenge
   */
  @OneToOne(() => ChallengeController, challengeController => challengeController.war)
  universalId!: ChallengeController
}
