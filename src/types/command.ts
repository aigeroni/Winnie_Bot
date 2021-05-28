import { GuildConfig } from '../models'
import { ApplicationCommandData, CommandInteraction } from 'discord.js'

/**
 * The shape of a command.
 *
 * When creating a command, you should be sure to localize all strings
 * which the command will use. There are some localization keys that
 * are used internally by the command logic in Winnie. Some of these
 * keys are required.
 *
 * Command locale strings should always live in `/locales/{{lng}}/commands.json`
 * and the top level key of the localization object should be the command's name.
 */
export interface Command {
  /**
   * The name of the command
   */
  name: string

  /**
   * Builds the command data object that gets sent to discord when registering a command
   */
  commandData: (locale: string) => Promise<ApplicationCommandData>

  /**
   * The function used to execute the command.
   *
   * This function can be asynchronous.
   *
   * @param message - The message which ran the command.
   * @param guildConfig - The configuration object for the guild the command was run in
   */
  execute: (interaction: CommandInteraction, guildConfig: GuildConfig) => Promise<void>
}
