import { Event } from '../types'
import { Guild } from 'discord.js'
import { GuildConfig } from '../models'
import { CommandUtils } from '../commands/utils'

/**
 * Handles the guildCreate event, fired whenever Winnie_Bot joins a new guild.
 *
 * Used for:
 *  - Creating a GuildConfig record for the new guild
 *  - Deploying initial commands to the guild
 */
export const GuildCreateEvent: Event = {
  name: 'guildCreate',
  handle: async (guild: Guild): Promise<void> => {
    const guildConfig = await GuildConfig.findOrCreate(guild.id)
    await CommandUtils.deployCommands(guildConfig)
  }
}
