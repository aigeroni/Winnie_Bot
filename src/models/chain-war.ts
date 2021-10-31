import { Challenge } from './bases/challenge'
import { Column, Entity } from 'typeorm'

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
}
