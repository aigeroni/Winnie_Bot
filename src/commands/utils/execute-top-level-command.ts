import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { SubCommand } from '../../types/subcommand'
import { Logger } from '../../core/logger'

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
  guildConfig: GuildConfig
): Promise<void> {
  const subcommand = interaction.options[0]

  const command = commands.find((c) => c.name === subcommand.name)
  if (command == null) { return }

  try {
    await command.execute(interaction, guildConfig)
  } catch (error) {
    const errorMessage: string = error.toString()
    Logger.error(`An Error occured while executing the command ${interaction.commandName}::${subcommand.name}: ${errorMessage}`)
  }
}

export { executeTopLevelCommand }
