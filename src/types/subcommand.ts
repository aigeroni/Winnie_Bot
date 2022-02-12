import { GuildConfig, UserConfig } from '../models'
import { ApplicationCommandOption, CommandInteraction } from 'discord.js'

/**
 * The shape of a subcommand.
 *
 * When creating a subcommand, you should be sure to localize all strings
 * which the command will use.
 *
 * Command locale strings should always live in `/locales/{{lng}}/commands.json`
 * and the top level key of the localization object should be the parents command's name.
 */
export interface SubCommand {
  /**
   * The name of the command
   */
  name: string

  /**
   * Builds the command data object that gets sent to discord when registering a command
   */
  commandData: (locale: string) => Promise<ApplicationCommandOption>

  /**
   * The function used to execute the command.
   *
   * This function can be asynchronous.
   *
   * @param message - The message which ran the command.
   * @param guildConfig - The configuration object for the guild the command was run in
   */
  execute: (interaction: CommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => Promise<void>
}
