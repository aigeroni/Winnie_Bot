import { BaseModel } from './bases/base-model'
import { Entity, JoinColumn, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ChainWar, Race, War } from '.'
import { ChallengeUser } from './challenge-user'
import { ChallengeChannel } from './challenge-channel'
import { Challenge } from './bases/challenge'
import { Logger } from '../core'

/**
 * Tracks universal challenge ids, unique across all challenge types.
 */
@Entity({ name: 'challenges_controller' })
export class ChallengeController extends BaseModel {
  /**
   * The universal challenge id
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The challenge's War instance
   *
   * Only present if the challenge is a war.
   */
  @OneToOne(() => War, war => war.universalId)
  @JoinColumn({ name: 'war_id' })
  war?: War | null

  /**
   * The challenge's Chain War instance
   *
   * Only present if the challenge is a chain.
   */
  @OneToOne(() => ChainWar, chainWar => chainWar.universalId)
  @JoinColumn({ name: 'chain_war_id' })
  chainWar?: ChainWar | null

  /**
   * The challenge's Race instance.
   *
   * Only present if the challenge is a race.
   */
  @OneToOne(() => Race, race => race.universalId)
  @JoinColumn({ name: 'race_id' })
  race?: Race | null

  /**
   * A list of users currently joined to the challenge
   */
  @OneToMany(() => ChallengeUser, challengeUser => challengeUser.challengeController)
  users!: ChallengeUser[]

  /**
   * A list of channels currently joined to the challenge
   */
  @OneToMany(() => ChallengeChannel, challengeChannel => challengeChannel.challengeController)
  channels!: ChallengeChannel[]

  challenge (): Challenge | undefined {
    Logger.info('pulling challenge')
    if (this.chainWar != null) {
      return this.chainWar
    }

    if (this.war != null) {
      Logger.info('returning war')
      return this.war
    }

    if (this.race != null) {
      return this.race
    }
  }
}
