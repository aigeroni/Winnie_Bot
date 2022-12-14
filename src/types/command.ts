import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'
import { GuildConfig, UserConfig } from '../models'

type CommandData = SlashCommandBuilder
| SlashCommandSubcommandBuilder
| SlashCommandSubcommandGroupBuilder
| SlashCommandSubcommandsOnlyBuilder

/**
 * Command executable by the command handler.
 */
export interface Command {
  /**
   * The name of the command
   */
  name: string

  /**
   * Data used to create the command with discord
   */
  data: (locale: string) => Promise<CommandData>

  /**
   * The function used to execute the command.
   *
   * This function can be asynchronous.
   *
   * @param message - The message which ran the command.
   * @param guildConfig - The configuration object for the guild the command was run in
   */
  execute: (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => Promise<void>
}
