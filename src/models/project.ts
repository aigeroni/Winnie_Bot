import { IsNotEmpty, IsPositive, MaxLength, ValidateIf } from "class-validator"
import { Permissions, Snowflake } from "discord.js"
import { Column, Entity } from "typeorm"
import { WinnieClient } from "../core"
import { GoalTypes } from "../types"
import { Mission } from "./bases/mission"
import { IsChannelWithPermission } from "./validators/channel-with-permission"

@Entity({ name: 'projects' })
export class Project extends Mission {
  /**
   * The project's name, used in project views.
   */
   @Column()
   @MaxLength(150)
   // Cannot contain profanity
   // Cannot mention entities
   // Cannot contain URLs
   name!: string

  /**
   * The target for the project.
   *
   * example: 80000 words, 400 pages
   */
  @Column()
  @IsPositive()
  target!: number

  /**
   * The type of goal for which the user is aiming for this project.
   *
   * Can be one of pages, words, minutes, lines, or items
   */
  @Column({ name: 'goal_type', type: 'enum', enum: GoalTypes })
  @IsNotEmpty()
  goalType: GoalTypes = GoalTypes.WORDS

  /**
   * The id of the channel in which the project was created.
   *
   * Used for sending messages about the project's status later.
   */
  @Column({ name: 'channel_id' })
  @ValidateIf(() => WinnieClient.isLoggedIn())
  @IsChannelWithPermission(Permissions.FLAGS.SEND_MESSAGES)
  @MaxLength(30)
  channelId!: Snowflake
}
