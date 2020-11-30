import I18n from './i18n'
import Logger from './logger'
import { Command } from './types'
import { Guild, Message, User } from 'discord.js'
import { GuildConfig } from '../models'

//TODO: remove once actual commands exist
declare const commands: Array<Command>

/**
 * Looks up a command class based on the name or alias used to
 * execute the command.
 *
 * @param commandName - The name of the command being ran.
 */
function findCommand(commandName: string): Command | undefined {
  return commands.find((c) => c.name === commandName || c.aliases?.includes(commandName))
}

/**
 * Check to see if the user has the required permissions to run a given command.
 *
 * @param command - The command being ran.
 * @param author - The user that ran the command.
 * @param guild - The guild in which the command was ran.
 */
async function checkPermissions(command: Command, author: User, guild: Guild | null): Promise<boolean> {
  if (!command.requiredPermissions || !guild) { return true }

  const member = await guild.members.fetch(author.id)
  return member.hasPermission(command.requiredPermissions)
}

/**
 * Executes the command. Prints and logs an error message if the command
 * was not able to execute successfully.
 *
 * @param command - The command being ran.
 * @param message - The message which sent the command.
 * @param args - The arguments passed to the command.
 * @param locale - The locale of the guild in which the command was ran.
 */
async function execute(command: Command, message: Message, args: Array<string>, locale: string): Promise<void> {
  try {
    await command.execute(message, args)
  } catch (error) {
    let errorMessage = await I18n.translate(locale, `commands:${command.name}.error`)
    if (!errorMessage) {
      errorMessage = await I18n.translate(locale, 'commands:defaultError')
    }

    message.channel.send(errorMessage)
    Logger.error(`An error occured executing command ${command.name}.\n${error}`)
  }
}

/**
 * This function serves as the entry point for commands. It ensures that the
 * message contains a command, was sent by a user, and the the user is allowed
 * to run the command before finally executing the command.
 *
 * @param message - The message that was sent and may contain a command.
 */
export default async function handleCommand(message: Message): Promise<void> {
  const guildConfig = await GuildConfig.findOne(message.guild?.id)
  if (!guildConfig) { return }

  if (!message.content.startsWith(guildConfig.prefix)) { return }
  if (message.author.bot) { return }

  const args = message.content.slice(guildConfig.prefix.length).split(/ +/)
  const commandName = args.shift()?.toLowerCase()
  if (!commandName) { return }

  const command = findCommand(commandName)
  if (!command) { return }

  if (!checkPermissions(command, message.author, message.guild)) { return }

  execute(command, message, args, guildConfig.locale)
}
