import { Challenge } from './bases/challenge'
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { ChainWar, ChallengeController } from '.'
import { DateTime, Duration } from 'luxon'

@Entity({ name: 'wars' })
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
  chainWar?: ChainWar | null

  /**
   * Challenge controller instance, contains the universal challenge id
   * as well as a list of users and channels joined to the challenge
   */
  @OneToOne(() => ChallengeController, challengeController => challengeController.war)
  @JoinColumn({ name: 'universal_id' })
  universalId!: ChallengeController | null

  olderThanTwelveHours (): boolean {
    const now = DateTime.utc()

    const twelveHoursFromEnd = Duration.fromObject({ minutes: this.duration + 720 })
    const twelveHoursFromStart = this.startAt.plus(twelveHoursFromEnd)

    return (twelveHoursFromStart.diff(now)).milliseconds <= 0
  }
}
