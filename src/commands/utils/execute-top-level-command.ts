import { CommandInteraction } from 'discord.js'
import { GuildConfig, UserConfig } from '../../models'
import { Logger } from '../../core'
import { SubCommand } from '../../types'

/**
 * A generic, reusable execute function for the top level command handler of commands
 * that have both subcommand groups and subcommands.
 *
 * @param commands A list of commands to use when executing
 * @param interaction the Interaction which was run
 * @param guildConfig the comfig for the guild the interaction was ran in
 */
async function executeTopLevelCommand (
  commands: SubCommand[],
  interaction: CommandInteraction,
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
    Logger.error(`An Error occured while executing the command ${interaction.commandName}${subcommandName}: ${errorMessage}`)
  }
}

export { executeTopLevelCommand }
