import { Challenge } from './bases/challenge'
import { Column, Entity, OneToMany } from 'typeorm'
import { War } from './war'

/**
 * Represents a chain war
 */
@Entity({ name: 'chain_wars' })
export class ChainWar extends Challenge {
  /**
   * The challenge name.
   */
  challenge_type = 'chain_war'

  /**
   * How long each war should last, in minutes.
   *
   * If not present, the default war length of 10 minutes will be used.
   */
  @Column()
  duration: number = 10

  /**
   * The total number of wars in the chain.
   */
  @Column({ name: 'number_of_wars' })
  numberOfWars!: number

  /**
   * The amount of time, in minutes, between the end of one war
   * and the beginning of the next.
   *
   * default = 5
   */
  @Column({ name: 'war_margin' })
  warMargin: number = 5

  /**
   * The list of wars that are a part of this chain war.
   */
  @OneToMany(() => War, war => war.chainId)
  wars!: War[]

  /**
   * Determines if there are additional wars in the chain.
   *
   * @returns Whether or not this chain war has additional wars
   */
  hasAnotherWar (): boolean {
    return this.wars.length < this.numberOfWars
  }
}
