import { ChatInputCommandInteraction, Routes, Snowflake } from 'discord.js'
import { Command } from '../types'
import { Commands } from '../commands'
import { GuildConfig, UserConfig } from '../models'
import { I18n, Logger, WinnieClient } from '../core'

/**
 * A generic, reusable execute function for the top level command handler of commands
 * that have both subcommand groups and subcommands.
 *
 * @param commands A list of commands to use when executing
 * @param interaction the Interaction which was run
 * @param guildConfig the config for the guild the interaction was ran in
 */
async function executeTopLevelCommand (
  commands: Command[],
  interaction: ChatInputCommandInteraction,
  guildConfig: GuildConfig,
  userConfig: UserConfig
): Promise<void> {
  const subcommand = interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(false)

  const command = commands.find((c) => c.name === subcommand)
  if (command == null) { return }

  try {
    await command.execute(interaction, guildConfig, userConfig)
  } catch (error: any) {
    const subcommandName = subcommand != null ? `::${subcommand}` : ''
    const errorMessage: string = error.toString()
    Logger.error(`An Error occurred while executing the command ${interaction.commandName}${subcommandName}: ${errorMessage}`)
  }
}

/**
  * Prints an error message for when something happens that should be impossible.
  *
  * @param interaction The interaction that was executed
  * @param locale the locale to use when looking up strings
  */
export async function printGenericError (interaction: ChatInputCommandInteraction, locale: string): Promise<void> {
  await interaction.reply(await I18n.translate(locale, 'commands:defaultError'))
}

export async function deployCommands (guildId?: Snowflake): Promise<void> {
  let commandData
  let route

  if (guildId == null) {
    commandData = await Commands.commandData(I18n.DEFAULT_LOCALE)

    route = Routes.applicationCommands('')
  } else {
    const guildConfig = await GuildConfig.findOrCreate(guildId)
    commandData = await Commands.commandData(guildConfig.locale)

    route = Routes.applicationGuildCommands('', guildConfig.id)
  }

  const restClient = WinnieClient.getRestAPIClient()

  await restClient.put(route, { body: commandData })
}

export const CommandService = {
  executeTopLevelCommand,
  printGenericError
}
