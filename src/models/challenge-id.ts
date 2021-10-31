import { BaseModel } from './bases/base-model'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Tracks universal challenge ids, unique across all challenge types.
 */
@Entity({ name: 'challenge_ids' })
export class ChallengeId extends BaseModel {
  /**
   * The universal challenge id
   */
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The challenge's Id in the war table.
   *
   * Only present if the challenge is a war.
   */
  @Column({ name: 'war_id', type: 'int' })
  warId?: number

  /**
   * The challenge's Id in the chain table.
   *
   * Only present if the challenge is a chain.
   */
  @Column({ name: 'chain_id', type: 'int' })
  chainId?: number

  /**
   * The challenge's Id in the race table.
   *
   * Only present if the challenge is a race.
   */
  @Column({ name: 'race_id', type: 'int' })
  raceId?: number
}
