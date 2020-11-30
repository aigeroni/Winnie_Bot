import { Message, PermissionResolvable } from 'discord.js'

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
 *
 * REQUIRED KEYS
 * * `commands:{{comandName}}.usage` - A string describing the usage of a command.
 * * `commands:{{comandName}}.description` - A brief description of what the command does.
 *
 * OPTIONAL KEYS
 * * `commands:{{commandName}}.error` - A message to show to users if an error happens
 *      while the command is executing.
 */
export interface Command {
  /**
   * The name of the command.
   *
   * A command name should generally be in English and should succinctly
   * describe what the command does.
   */
  name: string,

  /**
   * A list of strings that can be used to execute the command.
   *
   * This list should contain any strings (minus the name) the can
   * be used to run the command, including translations.
   */
  aliases?: Array<string>,

  /**
   * The permissions required to execute the command.
   */
  requiredPermissions?: Array<PermissionResolvable>,

  /**
   * The function used to execute the command.
   *
   * This function can be asynchronous.
   *
   * @param message - The message which ran the command.
   * @param args - The arguments passed to the command
   */
  execute(message: Message, args?: Array<string>): void,
}
