import { Event } from '../types'
import { Guild } from 'discord.js'
import { GuildConfig } from '../models'

/**
 * Handles the guildCreate event, fired whenever Winnie_Bot joins a new guild.
 *
 * Used for:
 *  - Creating a GuildConfig record for the new guild
 *  - Deploying initial commands to the guild
 */
export const GuildCreateEvent: Event = {
  name: 'guildCreate',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  handle: async (guild: Guild): Promise<void> => {
    await GuildConfig.findOrCreate(guild.id)
  }
}
