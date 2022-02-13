import { ChainWar } from '.'
import { Challenge } from './bases/challenge'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { DateTime, Duration } from 'luxon'

@Entity({ name: 'challenges' })
export class War extends Challenge {
  /**
   * The challenge name as a localisation key.
   */
  challenge_type = 'war'

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

  olderThanTwelveHours (): boolean {
    const now = DateTime.utc()

    const twelveHoursFromEnd = Duration.fromObject({ minutes: this.duration + 720 })
    const twelveHoursFromStart = this.startAt.plus(twelveHoursFromEnd)

    return (twelveHoursFromStart.diff(now)).milliseconds <= 0
  }
}
