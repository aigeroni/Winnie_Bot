import { Event } from '../types/event'
import { Guild } from 'discord.js'
import { GuildConfig } from '../models'

/**
 * Handles the guildCreate event, fired whenever Winnie_Bot joins a new guild.
 *
 * Used for:
 *  - Creating a GuildConfig record for the new guild
 */
export const GuildCreateEvent: Event = {
  name: 'guildCreate',
  handle: async (guild: Guild): Promise<void> => {
    await GuildConfig.findOrCreate(guild.id)
  },
}
