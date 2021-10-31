import { BaseModel } from './bases/base-model'
import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ChainWar, Race, War } from '.'
import { ChallengeUser } from './challenge-user'
import { ChallengeChannel } from './challenge-channel'

/**
 * Tracks universal challenge ids, unique across all challenge types.
 */
@Entity({ name: 'challenge_controller' })
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
  war?: War

  /**
   * The challenge's Chain War instance
   *
   * Only present if the challenge is a chain.
   */
  @OneToOne(() => ChainWar, chainWar => chainWar.universalId)
  @JoinColumn({ name: 'chain_war_id' })
  chainWar?: ChainWar

  /**
   * The challenge's Race instance.
   *
   * Only present if the challenge is a race.
   */
  @OneToOne(() => Race, race => race.universalId)
  @JoinColumn({ name: 'race_id' })
  race?: Race

  /**
   * A list of users currently joined to the challenge
   */
  @OneToMany(() => ChallengeUser, challengeUser => challengeUser.challengeController)
  users: ChallengeUser[] = []

  /**
   * A list of channels currently joined to the challenge
   */
  @OneToMany(() => ChallengeChannel, challengeChannel => challengeChannel.challengeController)
  channels: ChallengeChannel[] = []
}
