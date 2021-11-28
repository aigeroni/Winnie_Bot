import { Challenge } from './bases/challenge'
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { ChainWar } from '.'

@Entity({ name: 'wars' })
export class War extends Challenge {
  /**
   * The amount of time, in minutes, the war should last.
   *
   * default = 10 minutes
   */
  @Column({ name: 'duration' })
  duration: number = 10

  /**
   * The chain war this war is a part of.
   *
   * Null if the war is not part of a chain war.
   */
  @ManyToOne(() => ChainWar, chainWar => chainWar.wars)
  @JoinColumn({ name: 'chain_war_id' })
  chainId?: ChainWar

}
