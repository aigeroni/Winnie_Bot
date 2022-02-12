import { Commands } from '../commands'
import { Event } from '../types'
import { GuildConfig, UserConfig } from '../models'
import { Interaction } from 'discord.js'
import { Logger } from '../core'
/**
 * Handles the interaction event, fired when a user triggers an interaction.
 *
 * Used for:
 *  - responding to commands
 */
export const InteractionEvent: Event = {
  name: 'interaction',
  handle: async (interaction: Interaction) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!interaction.isCommand()) { return }
    if (interaction.guildId == null) { return }

    const command = Commands.commandList.find((c) => c.name === interaction.commandName)
    if (command == null) { return }

    const userConfig = await UserConfig.findOrCreate(interaction.user.id)
    const guildConfig = await GuildConfig.findOrCreate(interaction.guildId)

    try {
      await command.execute(interaction, guildConfig, userConfig)
    } catch (error: any) {
      const errorMessage: string = error.toString()
      Logger.error(`An Error occured while executing the command ${interaction.commandName}: ${errorMessage}`)
    }
  }
}
