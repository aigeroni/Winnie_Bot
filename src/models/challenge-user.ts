import { MaxLength } from 'class-validator'
import { Snowflake } from 'discord.js'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { ChallengeController } from './challenge-controller'
import { ChallengeTotalTypes } from '../types'
import { BaseModel } from './bases/base-model'

/**
 * Represents a user joined to a challenge.
 */
@Entity({ name: 'challenge_users' })
export class ChallengeUser extends BaseModel {
  /**
   * The challenge controller
   */
  @ManyToOne(() => ChallengeController, challengeController => challengeController.users, { primary: true })
  @JoinColumn({ name: 'challenge_id' })
  challengeController!: number

  /**
   * The user's discord Id
   */
  @PrimaryColumn({ name: 'user_id' })
  @MaxLength(30)
  userId!: Snowflake

  /**
   * The user's total for the challenge
   */
  @Column()
  total: number = 0

  /**
   * The type of the total.
   */
  @Column({ name: 'total_type', type: 'enum', enum: ChallengeTotalTypes })
  totalType!: ChallengeTotalTypes
}
